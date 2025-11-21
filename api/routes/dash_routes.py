from controleurs.dashboard_controleur import DashboardChart, DashboardStats, DashboardTodayUpdates

def init_dash_routes(api):
    api.add_resource(DashboardStats, '/dashboard/stats')
    api.add_resource(DashboardTodayUpdates, '/dashboard/today-updates')
    api.add_resource(DashboardChart, '/dashboard/chart')
