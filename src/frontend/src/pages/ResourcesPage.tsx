import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { BookOpen, FileText, Video, Download } from 'lucide-react';

export default function ResourcesPage() {
  const resourceCategories = [
    {
      icon: FileText,
      title: 'Study Materials',
      description: 'Comprehensive notes and guides covering all major topics for government job exams.',
    },
    {
      icon: Video,
      title: 'Video Lectures',
      description: 'Expert-led video tutorials explaining complex concepts in an easy-to-understand manner.',
    },
    {
      icon: Download,
      title: 'Practice Papers',
      description: 'Previous year question papers and practice sets to test your preparation.',
    },
    {
      icon: BookOpen,
      title: 'Reference Books',
      description: 'Curated list of recommended books and study materials for each subject.',
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Study Resources</h1>
        <p className="text-lg text-muted-foreground">
          Comprehensive study materials to help you prepare for government job exams
        </p>
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-2 border-primary/20 bg-primary/5 mb-8">
        <CardContent className="py-8 text-center">
          <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Resources Coming Soon</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're working hard to bring you comprehensive study materials, practice papers, and video lectures. 
            In the meantime, check out our news feed for the latest updates and exam-related information.
          </p>
        </CardContent>
      </Card>

      {/* Resource Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">What's Coming</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resourceCategories.map((category, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Subject Areas */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Subject Coverage</h2>
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'General Knowledge',
                'Current Affairs',
                'Mathematics',
                'English Language',
                'Reasoning',
                'General Science',
                'Indian History',
                'Geography',
                'Indian Polity',
                'Economics',
                'Computer Awareness',
                'Banking Awareness',
              ].map((subject, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{subject}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
