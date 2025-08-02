import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Send,
  CheckCircle,
  MapPin,
  Camera,
  Star,
  Flag,
  Lightbulb,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackItem {
  id: string;
  type: 'feedback' | 'report' | 'suggestion';
  category: string;
  message: string;
  rating?: number;
  location?: string;
  timestamp: Date;
  status: 'submitted' | 'acknowledged' | 'resolved';
  hasPhoto?: boolean;
}

interface QuickReport {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
}

interface FeedbackSystemProps {
  className?: string;
}

export const FeedbackSystem = ({ className }: FeedbackSystemProps) => {
  const [activeTab, setActiveTab] = useState('feedback');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myFeedback, setMyFeedback] = useState<FeedbackItem[]>([]);

  const quickReports: QuickReport[] = [
    {
      id: 'crowd',
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'Overcrowding',
      description: 'Report excessive crowd density',
      category: 'Safety',
      severity: 'high'
    },
    {
      id: 'cleanliness',
      icon: <Flag className="w-5 h-5" />,
      title: 'Cleanliness Issue',
      description: 'Report maintenance needed',
      category: 'Facility',
      severity: 'medium'
    },
    {
      id: 'accessibility',
      icon: <MapPin className="w-5 h-5" />,
      title: 'Accessibility',
      description: 'Report accessibility barriers',
      category: 'Accessibility',
      severity: 'high'
    },
    {
      id: 'lost-found',
      icon: <Heart className="w-5 h-5" />,
      title: 'Lost & Found',
      description: 'Report lost or found items',
      category: 'Service',
      severity: 'low'
    }
  ];

  const feedbackCategories = [
    'General Experience',
    'Navigation',
    'Events',
    'Food Service',
    'Cleanliness',
    'Staff Service',
    'Accessibility',
    'Technology',
    'Suggestions'
  ];

  const handleQuickReport = async (report: QuickReport) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newFeedback: FeedbackItem = {
      id: Date.now().toString(),
      type: 'report',
      category: report.category,
      message: `Quick report: ${report.title} - ${report.description}`,
      location: 'Current Location',
      timestamp: new Date(),
      status: 'submitted'
    };
    
    setMyFeedback(prev => [newFeedback, ...prev]);
    setIsSubmitting(false);
    setSubmitted(true);
    
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedCategory || !message) {
      alert('Please select a category and enter your feedback');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newFeedback: FeedbackItem = {
      id: Date.now().toString(),
      type: activeTab === 'feedback' ? 'feedback' : 'suggestion',
      category: selectedCategory,
      message,
      rating: rating || undefined,
      location: location || undefined,
      timestamp: new Date(),
      status: 'submitted'
    };
    
    setMyFeedback(prev => [newFeedback, ...prev]);
    
    // Reset form
    setSelectedCategory('');
    setMessage('');
    setRating(0);
    setLocation('');
    setIsSubmitting(false);
    setSubmitted(true);
    
    setTimeout(() => setSubmitted(false), 3000);
  };

  const getStatusColor = (status: FeedbackItem['status']) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: FeedbackItem['type']) => {
    switch (type) {
      case 'feedback': return <ThumbsUp className="w-4 h-4" />;
      case 'report': return <AlertTriangle className="w-4 h-4" />;
      case 'suggestion': return <Lightbulb className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: QuickReport['severity']) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (submitted) {
    return (
      <Card className={cn("p-6 text-center bg-green-50 border-green-200", className)}>
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Thank You!
        </h3>
        <p className="text-green-700 mb-4">
          Your feedback has been submitted successfully. We appreciate your input in helping us improve.
        </p>
        <p className="text-sm text-green-600">
          You can track the status of your feedback in the "My Feedback" tab.
        </p>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <ThumbsUp className="w-4 h-4" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Report
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            My Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ThumbsUp className="w-5 h-5" />
              Share Your Experience
            </h3>
            
            <div className="space-y-4">
              {/* Rating */}
              <div>
                <label className="text-sm font-medium mb-2 block">Overall Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="sm"
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={cn(
                          "w-6 h-6",
                          star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        )}
                      />
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select category...</option>
                  {feedbackCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium mb-2 block">Location (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Central Hall, Food Court"
                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-primary/20"
                  />
                  <Button variant="outline" size="sm" className="px-3">
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium mb-2 block">Your Feedback</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please share your experience, suggestions, or any concerns..."
                  className="min-h-[100px] resize-none"
                />
              </div>

              <Button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Quick Reports
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {quickReports.map((report) => (
                <Card
                  key={report.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:shadow-md",
                    getSeverityColor(report.severity)
                  )}
                  onClick={() => handleQuickReport(report)}
                >
                  <div className="text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center mx-auto">
                      {report.icon}
                    </div>
                    <h4 className="font-medium text-sm">{report.title}</h4>
                    <p className="text-xs text-muted-foreground">{report.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      {report.category}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                For emergencies, use the panic button or call emergency services directly at 112.
              </AlertDescription>
            </Alert>
          </Card>

          {/* Custom Report Form */}
          <Card className="p-6">
            <h4 className="font-medium mb-4">Custom Report</h4>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Issue Type</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select issue type...</option>
                  <option value="Safety">Safety Concern</option>
                  <option value="Facility">Facility Issue</option>
                  <option value="Accessibility">Accessibility</option>
                  <option value="Service">Service Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe the issue in detail..."
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Add Photo
                </Button>
                <Button variant="outline" className="flex-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              </div>

              <Button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-3">
            {myFeedback.map((feedback) => (
              <Card key={feedback.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(feedback.type)}
                      <div>
                        <h4 className="font-medium text-sm">{feedback.category}</h4>
                        <p className="text-xs text-muted-foreground">
                          {feedback.timestamp.toLocaleDateString()} at {feedback.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <Badge className={getStatusColor(feedback.status)}>
                      {feedback.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {feedback.message}
                  </p>

                  {feedback.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{feedback.location}</span>
                    </div>
                  )}

                  {feedback.rating && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "w-3 h-3",
                            star <= feedback.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {myFeedback.length === 0 && (
            <Card className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No feedback submitted yet</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};