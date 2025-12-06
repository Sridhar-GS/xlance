import React, { useState, useMemo } from 'react';
import PageTransition from '../components/common/PageTransition';
import { Card, Button } from '../components/common';
import { Briefcase, AlertTriangle, Pause, Award, Feather, HandshakeIcon, Trophy, PenLine, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const sampleProjects = [
  {
    id: 'p1',
    title: 'Landing page redesign for fintech startup',
    client: 'FinEdge Solutions',
    status: 'Active',
    budget: '₹45,000',
    acceptancedate: '10-12-2024',
    deadline: '01-01-2025',
  },
  {
    id: 'p2',
    title: 'Mobile app UI for e-commerce',
    client: 'ShopKart',
    status: 'Completed',
    budget: '₹1,25,000',
    acceptancedate: '10-12-2024',
    deadline: '01-01-2025',
  },
  {
    id: 'p3',
    title: 'Social media creatives pack',
    client: 'GrowSocial Agency',
    status: 'Draft',
    budget: '₹12,000',
    acceptancedate: '10-12-2024',
    deadline: '01-01-2025'
  },
];

const MyProjects = () => {
  const { userProfile } = useAuth();
  const [filter, setFilter] = useState('Active');

  const projects = useMemo(() => sampleProjects, []);

  const filtered = projects.filter((p) => (filter === 'All' ? true : p.status === filter));

  return (
    <PageTransition>
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <header className="mt-20 mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your active work, drafts and completed projects.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button className="hidden sm:inline-flex">Create New Project</Button>
            </div>
          </header>

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {['All', 'Active', 'Completed', 'Draft'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`text-sm px-3 py-1 rounded-md ${filter === tab ? 'text-primary-600 bg-primary-50 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-500">Showing <span className="font-medium text-gray-700">{filtered.length}</span> projects</div>
          </div>

          <div className="space-y-6">
            {filtered.length === 0 ? (
              <Card className="p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900">No projects found</h3>
                <p className="text-sm text-gray-600 mt-2">Create a new project to get started or switch filters.</p>
                <div className="mt-4">
                  <Button>Create Project</Button>
                </div>
              </Card>
            ) : (
              filtered.map((p) => (
                <Card key={p.id} className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Briefcase size={20} className="text-gray-500" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">Client : {p.client}</p>
                        </div>

                        <div className="flex flex-col items-end">
                          <StatusPill status={p.status} />
                          <div className="text-lg font-semibold text-gray-900 mt-3">{p.budget}</div>
                        </div>
                      </div>
                        
                      <div className="mt-4 flex items-center gap-4">
                        {p.deadline && (
                          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm">
                            <HandshakeIcon size={14} />
                            <span>Handshaken : {p.acceptancedate}</span>
                          </div>
                        )}
                        {p.deadline && (
                          <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm">
                            <AlertTriangle size={14} />
                            <span>Deadline: {p.deadline}</span>
                          </div>
                        )}
                        </div>
                        
                        <div className="mt-4 flex items-center gap-4">
                        
                        <a className="text-sm text-primary-600 font-medium">View Details</a>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </PageTransition>
  );
};

// small helper component to render status pill with icon + label
function StatusPill({ status }) {
  const base = 'text-xs px-3 py-1 rounded-full inline-flex items-center gap-2';
  if (status === 'Active') {
    return (
      <div className={`${base} bg-green-100 text-green-700`}>
        <Play size={14} />
        <span>Active</span>
      </div>
    );
  }

  if (status === 'Completed') {
    return (
      <div className={`${base} bg-gray-100 text-gray-700`}>
        <Trophy size={14} />
        <span>Completed</span>
      </div>
    );
  }

  // Draft
  return (
    <div className={`${base} bg-yellow-100 text-yellow-700`}>
      <PenLine size={14} />
      <span>Draft</span>
    </div>
  );
}

export default MyProjects;
