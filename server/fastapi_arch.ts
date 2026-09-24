export const fastApiCode = `from fastapi import FastAPI, Depends, HTTPException, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List
import google.generativeai as genai
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models
import os

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FitBuddy AI Fitness Engine",
    description="Personalized 7-Day Workout Plans & Dynamic Plan Updating with Google Gemini",
    version="1.5.0"
)

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Google Gemini Configuration
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model_pro = genai.GenerativeModel("gemini-1.5-pro")
model_flash = genai.GenerativeModel("gemini-1.5-flash")

# Dependency for DB Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------- Jinja2 Web Routes -----------------
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Render FitBuddy home page with goal and intensity selection."""
    return templates.TemplateResponse("index.html", {
        "request": request,
        "title": "FitBuddy – AI Fitness Plan Generator"
    })

@app.post("/generate_plan", response_class=HTMLResponse)
async def generate_plan(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    age: int = Form(25),
    weight_kg: float = Form(70.0),
    fitness_goal: str = Form(...), # weight-loss, muscle-gain, general-wellness
    workout_intensity: str = Form("medium"), # low, medium, high
    experience_level: str = Form("beginner"),
    available_equipment: str = Form("Dumbbells, Bodyweight"),
    db: Session = Depends(get_db)
):
    """Generates a 7-day workout plan using Gemini 1.5 Pro and stores in SQLite."""
    prompt = f"""
    Create a structured 7-day workout plan for:
    - Name: {name}, Age: {age}, Weight: {weight_kg}kg
    - Primary Goal: {fitness_goal}
    - Workout Intensity: {workout_intensity} (low, medium, high)
    - Experience: {experience_level}
    - Equipment: {available_equipment}
    Provide 7 days with sets, reps, rest intervals, warm-ups, and cool-downs in JSON format.
    """
    ai_response = model_pro.generate_content(prompt)
    plan_json = ai_response.text

    # Upsert user and save original workout plan to SQLite via SQLAlchemy
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(
            name=name, email=email, age=age, weight_kg=weight_kg,
            fitness_goal=fitness_goal, workout_intensity=workout_intensity,
            experience_level=experience_level
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    plan = models.WorkoutPlan(
        user_id=user.id,
        title=f"{name}'s 7-Day {fitness_goal.title()} Routine",
        target_goal=fitness_goal,
        workout_intensity=workout_intensity,
        plan_type="original",
        plan_json=plan_json
    )
    db.add(plan)
    db.commit()

    return templates.TemplateResponse("plan.html", {
        "request": request,
        "user": user,
        "plan": plan
    })

@app.post("/feedback_update", response_class=HTMLResponse)
async def update_plan(
    request: Request,
    user_id: str = Form(...),
    feedback: str = Form(...), # e.g. "Add cardio" or "Add yoga"
    db: Session = Depends(get_db)
):
    """Applies user feedback using Gemini and saves the updated plan."""
    original_plan = db.query(models.WorkoutPlan).filter(
        models.WorkoutPlan.user_id == user_id,
        models.WorkoutPlan.plan_type == "original"
    ).first()

    update_prompt = f"Modify this plan based on feedback: '{feedback}'. Keep 7 days, insert cardio/yoga. Plan: {original_plan.plan_json}"
    updated_json = model_pro.generate_content(update_prompt).text

    # Record feedback log
    fb_log = models.FeedbackLog(user_id=user_id, plan_id=original_plan.id, feedback_text=feedback)
    db.add(fb_log)

    updated_plan = models.WorkoutPlan(
        user_id=user_id,
        title=f"{original_plan.title} (Updated)",
        target_goal=original_plan.target_goal,
        workout_intensity=original_plan.workout_intensity,
        plan_type="updated",
        adaptation_reason=f"Applied feedback: {feedback}",
        plan_json=updated_json
    )
    db.add(updated_plan)
    db.commit()

    return RedirectResponse(url=f"/plan/{user_id}", status_code=303)

@app.get("/admin", response_class=HTMLResponse)
async def admin_dashboard(request: Request, db: Session = Depends(get_db)):
    """Admin Dashboard: View all registered users, their original and updated plans."""
    users = db.query(models.User).all()
    return templates.TemplateResponse("admin.html", {
        "request": request,
        "users": users
    })
`;

export const sqlAlchemyCode = `from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./fitbuddy.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    age = Column(Integer, default=25)
    weight_kg = Column(Float, default=70.0)
    fitness_goal = Column(String(50), nullable=False)  # weight-loss, muscle-gain, general-wellness
    workout_intensity = Column(String(20), default="medium")  # low, medium, high
    experience_level = Column(String(20), default="beginner")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    workout_plans = relationship("WorkoutPlan", back_populates="user", cascade="all, delete-orphan")
    feedback_logs = relationship("FeedbackLog", back_populates="user", cascade="all, delete-orphan")

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    target_goal = Column(String(50), nullable=False)
    workout_intensity = Column(String(20), default="medium")  # low, medium, high
    plan_type = Column(String(20), default="original")  # 'original' or 'updated'
    adaptation_reason = Column(Text, nullable=True)
    plan_json = Column(Text, nullable=False)  # 7-day structured JSON with sets, reps, rest
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="workout_plans")

class FeedbackLog(Base):
    __tablename__ = "feedback_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    plan_id = Column(String, nullable=True)
    feedback_text = Column(Text, nullable=False)
    applied_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="feedback_logs")
`;

export const jinjaTemplates = {
  'templates/index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FitBuddy – AI Fitness Plan Generator</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-950 text-white min-h-screen p-8">
  <div class="max-w-3xl mx-auto space-y-6">
    <div class="border-b border-gray-800 pb-4">
      <h1 class="text-3xl font-extrabold text-emerald-400">FitBuddy</h1>
      <p class="text-sm text-gray-400">Generate a personalized 7-day workout plan using Google Gemini 1.5 Pro</p>
    </div>

    <form action="/generate_plan" method="POST" class="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">Athlete Name</label>
          <input type="text" name="name" required class="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-sm text-white">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
          <input type="email" name="email" required class="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-sm text-white">
        </div>
      </div>

      <!-- Goal Selection -->
      <div>
        <label class="block text-xs font-semibold text-gray-300 mb-1">Primary Fitness Goal</label>
        <select name="fitness_goal" class="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-sm text-white">
          <option value="weight-loss">Weight Loss & Fat Burning</option>
          <option value="muscle-gain">Muscle Gain & Hypertrophy</option>
          <option value="general-wellness">General Wellness & Longevity</option>
        </select>
      </div>

      <!-- Workout Intensity Selection -->
      <div>
        <label class="block text-xs font-semibold text-gray-300 mb-1">Workout Intensity</label>
        <div class="grid grid-cols-3 gap-3">
          <label class="flex items-center gap-2 p-3 bg-gray-950 rounded-lg border border-gray-700 cursor-pointer">
            <input type="radio" name="workout_intensity" value="low">
            <span class="text-xs">Low (Gentle/Joint-Safe)</span>
          </label>
          <label class="flex items-center gap-2 p-3 bg-gray-950 rounded-lg border border-emerald-500 cursor-pointer">
            <input type="radio" name="workout_intensity" value="medium" checked>
            <span class="text-xs">Medium (Standard Tempo)</span>
          </label>
          <label class="flex items-center gap-2 p-3 bg-gray-950 rounded-lg border border-gray-700 cursor-pointer">
            <input type="radio" name="workout_intensity" value="high">
            <span class="text-xs">High (High Volume/HIIT)</span>
          </label>
        </div>
      </div>

      <button type="submit" class="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl shadow-lg">
        Generate 7-Day Plan with Gemini 1.5 Pro
      </button>
    </form>
  </div>
</body>
</html>`,

  'templates/plan.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{ plan.title }} – FitBuddy</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-950 text-white min-h-screen p-8">
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between border-b border-gray-800 pb-4">
      <div>
        <h1 class="text-2xl font-black text-white">{{ plan.title }}</h1>
        <p class="text-xs text-emerald-400">Athlete: {{ user.name }} ({{ user.fitness_goal }} · {{ plan.workout_intensity|upper }} Intensity)</p>
      </div>
      <a href="/admin" class="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg">Admin View</a>
    </div>

    <!-- 7-Day Workout Table / Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {% for day in plan.days %}
      <div class="p-4 rounded-xl bg-gray-900 border border-gray-800">
        <h3 class="font-bold text-emerald-300 text-sm">{{ day.dayName }}</h3>
        <p class="text-xs text-gray-400 mt-1">{{ day.focus }} ({{ day.estimatedMinutes }} mins)</p>
        <ul class="mt-2 space-y-1 text-xs">
          {% for ex in day.exercises %}
          <li class="flex justify-between text-gray-300">
            <span>{{ ex.name }}</span>
            <span class="font-mono text-emerald-400">{{ ex.sets }} × {{ ex.repsOrDuration }} ({{ ex.restSeconds }}s rest)</span>
          </li>
          {% endfor %}
        </ul>
      </div>
      {% endfor %}
    </div>

    <!-- Feedback-Based Plan Updating Form -->
    <div class="p-6 bg-gray-900 border border-emerald-500/30 rounded-2xl space-y-3">
      <h3 class="text-sm font-bold text-white">Give Feedback to Update Plan</h3>
      <p class="text-xs text-gray-400">Request modifications like "Add cardio intervals" or "Add morning yoga flow". Gemini will revise your routine.</p>
      <form action="/feedback_update" method="POST" class="flex gap-2">
        <input type="hidden" name="user_id" value="{{ user.id }}">
        <input type="text" name="feedback" placeholder="e.g. Add 15-minute cardio finisher on Day 2" class="flex-1 bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-xs text-white">
        <button type="submit" class="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs rounded-lg">
          Update Plan
        </button>
      </form>
    </div>
  </div>
</body>
</html>`,

  'templates/admin.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Admin Dashboard – FitBuddy</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-950 text-white min-h-screen p-8">
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between border-b border-gray-800 pb-4">
      <div>
        <h1 class="text-2xl font-black text-white">Admin Dashboard</h1>
        <p class="text-xs text-gray-400">View registered users and their original & updated workout plans (SQLite & SQLAlchemy)</p>
      </div>
      <a href="/" class="text-xs px-3 py-1.5 bg-emerald-500 text-gray-950 font-bold rounded-lg">+ New Athlete</a>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs text-gray-300">
        <thead class="bg-gray-900 text-gray-400 uppercase font-mono">
          <tr>
            <th class="p-3">Athlete</th>
            <th class="p-3">Email</th>
            <th class="p-3">Goal</th>
            <th class="p-3">Intensity</th>
            <th class="p-3">Original Plan</th>
            <th class="p-3">Updated Plan</th>
            <th class="p-3">Feedback History</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          {% for user in users %}
          <tr class="hover:bg-gray-900/50">
            <td class="p-3 font-bold text-white">{{ user.name }}</td>
            <td class="p-3 text-gray-400 font-mono">{{ user.email }}</td>
            <td class="p-3">{{ user.fitness_goal }}</td>
            <td class="p-3 font-semibold text-emerald-400">{{ user.workout_intensity|upper }}</td>
            <td class="p-3 text-emerald-300">Generated</td>
            <td class="p-3">
              {% if user.updated_plan %}
              <span class="text-cyan-400">Adapted (Cardio/Yoga)</span>
              {% else %}
              <span class="text-gray-500">None</span>
              {% endif %}
            </td>
            <td class="p-3 text-xs text-gray-400">{{ user.feedback_logs|length }} requests</td>
          </tr>
          {% endfor %}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`
};
