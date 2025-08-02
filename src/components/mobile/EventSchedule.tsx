import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Bell,
  BellOff,
  Info,
  Volume2,
  Bookmark,
  BookmarkCheck,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  capacity: number;
  registered: number;
  category: 'meditation' | 'discourse' | 'cultural' | 'meal' | 'special';
  priority: 'low' | 'medium' | 'high';
  isNotificationEnabled: boolean;
  isBookmarked: boolean;
  speaker?: string;
  requirements?: string[];
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'urgent' | 'update' | 'weather';
  timestamp: Date;
  location?: string;
  isRead: boolean;
}

interface EventScheduleProps {
  className?: string;
}

export const EventSchedule = ({ className }: EventScheduleProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<'all' | Event['category']>('all');

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockEvents: Event[] = [
      {
        id: '1',
        title: 'Morning Meditation',
        description: 'Start your day with peaceful meditation in the main hall',
        startTime: new Date(2024, 11, 15, 6, 0),
        endTime: new Date(2024, 11, 15, 7, 0),
        location: 'Central Meditation Hall',
        capacity: 500,
        registered: 342,
        category: 'meditation',
        priority: 'high',
        isNotificationEnabled: true,
        isBookmarked: true,
        speaker: 'Rev. Master',
        requirements: ['Comfortable seating', 'Silent mode']
      },
      {
        id: '2',
        title: 'Evening Discourse',
        description: 'Spiritual discourse on the principles of Raja Yoga',
        startTime: new Date(2024, 11, 15, 18, 0),
        endTime: new Date(2024, 11, 15, 19, 30),
        location: 'Main Auditorium',
        capacity: 800,
        registered: 650,
        category: 'discourse',
        priority: 'high',
        isNotificationEnabled: true,
        isBookmarked: false,
        speaker: 'Sister Shivani',
        requirements: ['Notebook optional', 'Questions welcome']
      },
      {
        id: '3',
        title: 'Community Lunch',
        description: 'Organic vegetarian meal served with love',
        startTime: new Date(2024, 11, 15, 12, 0),
        endTime: new Date(2024, 11, 15, 14, 0),
        location: 'Dining Hall',
        capacity: 1000,
        registered: 756,
        category: 'meal',
        priority: 'medium',
        isNotificationEnabled: false,
        isBookmarked: false,
        requirements: ['Bring own water bottle', 'No outside food']
      },
      {
        id: '4',
        title: 'Cultural Program',
        description: 'Traditional music and dance performances',
        startTime: new Date(2024, 11, 15, 19, 45),
        endTime: new Date(2024, 11, 15, 21, 0),
        location: 'Open Ground',
        capacity: 1200,
        registered: 234,
        category: 'cultural',
        priority: 'low',
        isNotificationEnabled: false,
        isBookmarked: true
      }
    ];

    const mockAnnouncements: Announcement[] = [
      {
        id: '1',
        title: 'Weather Update',
        message: 'Light rain expected this evening. Cultural program moved to Indoor Auditorium.',
        type: 'weather',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        location: 'Cultural Program',
        isRead: false
      },
      {
        id: '2',
        title: 'Parking Information',
        message: 'Additional parking available in the North Wing. Free shuttle service every 15 minutes.',
        type: 'info',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: true
      },
      {
        id: '3',
        title: 'Meal Service Update',
        message: 'Due to high demand, lunch service extended until 2:30 PM today.',
        type: 'update',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isRead: true
      }
    ];

    setEvents(mockEvents);
    setAnnouncements(mockAnnouncements);
  }, []);

  const toggleNotification = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isNotificationEnabled: !event.isNotificationEnabled }
        : event
    ));
  };

  const toggleBookmark = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isBookmarked: !event.isBookmarked }
        : event
    ));
  };

  const markAnnouncementRead = (announcementId: string) => {
    setAnnouncements(prev => prev.map(announcement => 
      announcement.id === announcementId 
        ? { ...announcement, isRead: true }
        : announcement
    ));
  };

  const getCategoryColor = (category: Event['category']) => {
    switch (category) {
      case 'meditation': return 'bg-blue-100 text-blue-800';
      case 'discourse': return 'bg-purple-100 text-purple-800';
      case 'cultural': return 'bg-green-100 text-green-800';
      case 'meal': return 'bg-orange-100 text-orange-800';
      case 'special': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAnnouncementColor = (type: Announcement['type']) => {
    switch (type) {
      case 'urgent': return 'border-red-200 bg-red-50';
      case 'weather': return 'border-blue-200 bg-blue-50';
      case 'update': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getAnnouncementIcon = (type: Announcement['type']) => {
    switch (type) {
      case 'urgent': return <Bell className="w-4 h-4 text-red-500" />;
      case 'weather': return <Volume2 className="w-4 h-4 text-blue-500" />;
      case 'update': return <Info className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredEvents = events.filter(event => 
    filter === 'all' || event.category === filter
  );

  const todayEvents = filteredEvents.filter(event => 
    event.startTime.toDateString() === selectedDate.toDateString()
  );

  const unreadAnnouncements = announcements.filter(a => !a.isRead);

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2 relative">
            <Bell className="w-4 h-4" />
            Announcements
            {unreadAnnouncements.length > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs">
                {unreadAnnouncements.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {/* Date and Filter */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Events
              </h3>
              <Badge variant="outline">
                {todayEvents.length} events
              </Badge>
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['all', 'meditation', 'discourse', 'cultural', 'meal', 'special'].map((category) => (
                <Button
                  key={category}
                  variant={filter === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(category as any)}
                  className="text-xs whitespace-nowrap"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </Card>

          {/* Events List */}
          <div className="space-y-3">
            {todayEvents.map((event) => (
              <Card key={event.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{event.title}</h4>
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                        {event.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">
                            Priority
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                      {event.speaker && (
                        <p className="text-xs text-primary font-medium mt-1">
                          Speaker: {event.speaker}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(event.id)}
                      >
                        {event.isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-primary" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleNotification(event.id)}
                      >
                        {event.isNotificationEnabled ? (
                          <Bell className="w-4 h-4 text-primary" />
                        ) : (
                          <BellOff className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {event.startTime.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - 
                        {event.endTime.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{event.registered}/{event.capacity} registered</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-muted-foreground" />
                      <span className={cn(
                        "text-xs px-2 py-1 rounded",
                        event.registered / event.capacity > 0.8 
                          ? "bg-red-100 text-red-700" 
                          : "bg-green-100 text-green-700"
                      )}>
                        {event.registered / event.capacity > 0.8 ? 'Nearly Full' : 'Available'}
                      </span>
                    </div>
                  </div>

                  {event.requirements && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-muted-foreground mb-1">Requirements:</p>
                      <div className="flex flex-wrap gap-1">
                        {event.requirements.map((req, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <MapPin className="w-4 h-4 mr-2" />
                      Navigate
                    </Button>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {todayEvents.length === 0 && (
            <Card className="p-6 text-center">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No events found for selected filter</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <Card
                key={announcement.id}
                className={cn(
                  "p-4 cursor-pointer transition-all",
                  getAnnouncementColor(announcement.type),
                  !announcement.isRead && "ring-2 ring-primary/20"
                )}
                onClick={() => markAnnouncementRead(announcement.id)}
              >
                <div className="flex items-start gap-3">
                  {getAnnouncementIcon(announcement.type)}
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{announcement.title}</h4>
                      <div className="flex items-center gap-2">
                        {!announcement.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(announcement.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {announcement.message}
                    </p>
                    
                    {announcement.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{announcement.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>

          {announcements.length === 0 && (
            <Card className="p-6 text-center">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No announcements available</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};