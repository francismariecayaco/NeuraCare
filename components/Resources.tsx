
import React from 'react';

const resourceLinks = [
  { title: 'Understanding Anxiety Disorders', url: '#', source: 'MentalHealth.gov' },
  { title: 'Coping with Depression', url: '#', source: 'NIMH' },
  { title: 'Mindfulness for Beginners', url: '#', source: 'Mindful.org' },
  { title: 'How to Find a Therapist', url: '#', source: 'NAMI' },
];

const hotlines = [
    { name: 'Crisis Text Line', contact: 'Text HOME to 741741', description: 'Free, 24/7 support for those in crisis.'},
    { name: 'National Suicide Prevention Lifeline', contact: 'Call 988', description: '24/7, free and confidential support.' },
]

const ResourceCard: React.FC<{ title: string; url: string; source: string }> = ({ title, url, source }) => (
  <a href={url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
    <h4 className="font-semibold text-blue-600">{title}</h4>
    <p className="text-sm text-gray-500 mt-1">{source}</p>
  </a>
);

const Resources: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto mt-8 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Helpful Resources</h2>
      <p className="text-gray-600 mb-6">Here are some articles and services that can provide more information and support.</p>
      
       <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500">
            <h3 className="font-bold text-red-800">Immediate Help</h3>
            <p className="text-red-700">If you are in crisis or need immediate support, please reach out to one of these services.</p>
            <div className="mt-4 space-y-2">
                 {hotlines.map(h => (
                    <div key={h.name}>
                        <p className="font-semibold text-gray-800">{h.name}: <span className="font-bold text-red-900">{h.contact}</span></p>
                        <p className="text-sm text-gray-600">{h.description}</p>
                    </div>
                 ))}
            </div>
       </div>

      <div className="space-y-4">
        {resourceLinks.map(link => (
          <ResourceCard key={link.title} {...link} />
        ))}
      </div>
    </div>
  );
};

export default Resources;
