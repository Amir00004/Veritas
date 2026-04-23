from django.urls import path

from .views import ProfessorResearchView, TaskStatusView

app_name = "research"

urlpatterns = [
    path("professor/", ProfessorResearchView.as_view(), name="research-professor"),
    path("task/<str:task_id>/", TaskStatusView.as_view(), name="task-status"),
]
