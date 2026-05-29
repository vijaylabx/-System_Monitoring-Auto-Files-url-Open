from backend.database.database import SessionLocal
from backend.database.models import ProcessLog
from sqlalchemy import func
from datetime import datetime, timedelta

class AnalyticsEngine:
    def get_daily_summary(self):
        db = SessionLocal()
        cutoff = datetime.utcnow() - timedelta(hours=24)
        
        # Aggregate duration by application name over the last 24 hours
        results = db.query(
            ProcessLog.name, 
            func.sum(ProcessLog.duration_seconds).label("total_duration")
        ).filter(
            ProcessLog.start_time >= cutoff,
            ProcessLog.duration_seconds > 0
        ).group_by(ProcessLog.name).order_by(func.sum(ProcessLog.duration_seconds).desc()).limit(15).all()
        
        db.close()
        
        # Filter out OS noise
        noise = ['svchost.exe', 'explorer.exe', 'RuntimeBroker.exe', 'Taskmgr.exe', 'SearchApp.exe', 'System', 'conhost.exe']
        filtered_results = [{"name": r[0], "duration": round(r[1]/60, 1)} for r in results if r[0] not in noise and r[1] > 60]
        
        insights = []
        if filtered_results:
            top_app = filtered_results[0]
            insights.append(f"Most used app today: {top_app['name']} ({top_app['duration']} mins).")
            insights.append(f"You've been active across {len(filtered_results)} main applications.")
            if any('Code' in r['name'] for r in filtered_results):
                insights.append("Good coding session detected!")
        else:
            insights.append("Not enough data collected today.")
            insights.append("Keep the dashboard running to generate insights.")
            
        return {
            "insights": insights,
            "top_software": filtered_results
        }

engine = AnalyticsEngine()
