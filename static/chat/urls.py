from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.index_view, name='index'),
    path('chat/', views.chat_view, name='chat-home'),

]

#urlpatterns = [
#    path(r'chat/$', views.chat_view, name='chat-home'),
#    path(r'^$', views.index_view, name='index'),
##    path(r'^admin/', admin.site.urls),
#]
