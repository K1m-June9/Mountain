from typing import List, Dict, Any
from pydantic import BaseModel

class UserDashboardStats(BaseModel):
    totalUsers: int
    activeUsers: int
    inactiveUsers: int
    suspendedUsers: int
    roleStats: List[Dict[str, Any]]
    statusStats: List[Dict[str, Any]]
    monthlyStats: List[Dict[str, Any]]
    institutionStats: List[Dict[str, Any]]
    
    class Config:
        from_attributes = True