import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ExternalLink, Calendar, Tag, Plus, X, Users } from 'lucide-react';
import { supabase } from './supabaseClient';
import MultiSelectMakers from './components/MultiSelectMakers';

interface Status {
  id: number;
  name: string;
}

interface Type {
  id: number;
  name: string;
}

interface Maker {
  id: number;
  name: string;
}

interface Project {
  id: string;
  project_title: string;
  status_id: number;
  type_id: number;
  timeframe: string;
  description: string;
  link?: string;
  project_makers: { maker_id: number }[];
  status: Status; // Joined status object
  type: Type;     // Joined type object
}

function App() {
  const [theme, setTheme] = useState(() => {
    if (localStorage.getItem('theme')) {
      return localStorage.getItem('theme');
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [allMakers, setAllMakers] = useState<Maker[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>(['Active', 'Hibernation', 'Graveyard', 'Completed']);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoadingLookupData, setIsLoadingLookupData] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [currentProjectForm, setCurrentProjectForm] = useState({
    project_title: '',
    status_id: 0,
    type_id: 0,
    timeframe: '',
    description: '',
    makers: [], // Now stores selected maker IDs (as strings initially from select)
    link: '',
  });

  useEffect(() => {
    const fetchLookupData = async () => {
      setIsLoadingLookupData(true);
      console.log('Fetching lookup data...');
      const { data: statusData, error: statusError } = await supabase.from('project_status').select('*');
      if (statusError) console.error('Error fetching statuses:', statusError);
      else {
        setStatuses(statusData || []);
        setStatusFilter(statusData?.map(s => s.name) || []);
        console.log('Fetched statuses:', statusData);
      }

      const { data: typeData, error: typeError } = await supabase.from('project_type').select('*');
      if (typeError) console.error('Error fetching types:', typeError);
      else {
        setTypes(typeData || []);
        setTypeFilter(typeData?.map(t => t.name) || []);
        console.log('Fetched types:', typeData);
      }

      const { data: makersData, error: makersError } = await supabase.from('makers').select('*');
      if (makersError) console.error('Error fetching makers:', makersError);
      else {
        setAllMakers(makersData || []);
        console.log('Fetched makers:', makersData);
      }

      // Set initial currentProjectForm status_id and type_id after fetching lookup data
      setCurrentProjectForm(prev => ({
        ...prev,
        status_id: statusData?.[0]?.id || 0,
        type_id: typeData?.[0]?.id || 0,
      }));
      setIsLoadingLookupData(false);
      console.log('Lookup data fetching complete.');
    };

    fetchLookupData();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          status:project_status(name),
          type:project_type(name),
          project_makers(maker_id)
        `);
      if (error) console.error('Error fetching projects:', error);
      else setProjects(data as Project[] || []);
    };

    fetchProjects();
  }, []);

  const statusCounts = useMemo(() => {
    return statuses.reduce((acc, status) => {
      acc[status.name] = projects.filter(p => p.status.name === status.name).length;
      return acc;
    }, {} as Record<string, number>);
  }, [projects, statuses]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.project_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter.includes(project.status.name);
      const matchesType = typeFilter.includes(project.type.name);
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchTerm, statusFilter, typeFilter, projects]);

  const getStatusColor = (statusName: string) => {
    switch (statusName) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Hibernation':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Graveyard':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (statusName: string) => {
    switch (statusName) {
      case 'Active':
        return '🟢';
      case 'Hibernation':
        return '🟡';
      case 'Graveyard':
        return '🔴';
      case 'Completed':
        return '🔵';
      default:
        return '⚪';
    }
  };

  const getTypeColor = (typeName: string) => {
    switch (typeName) {
      case 'Product':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Program':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Hackathon':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Collaboration':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleFilter = (filterArray: string[], setFilter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (filterArray.includes(value)) {
      setFilter(filterArray.filter(item => item !== value));
    } else {
      setFilter([...filterArray, value]);
    }
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setCurrentProjectForm({
      project_title: project.project_title,
      status_id: project.status_id,
      type_id: project.type_id,
      timeframe: project.timeframe,
      description: project.description,
      makers: project.project_makers.map(pm => String(pm.maker_id)),
      link: project.link || '',
    });
    setShowAddForm(true);
  };

  const handleSubmitProject = async () => {
    console.log('Attempting to submit project:', currentProjectForm);
    try {
      let projectResult;
      if (editingProject) {
        // Update existing project
        const { data, error } = await supabase
          .from('projects')
          .update({
            project_title: currentProjectForm.project_title,
            status_id: currentProjectForm.status_id,
            type_id: currentProjectForm.type_id,
            timeframe: currentProjectForm.timeframe,
            description: currentProjectForm.description,
            link: currentProjectForm.link || null,
          })
          .eq('id', editingProject.id)
          .select();
        projectResult = { data, error };
      } else {
        // Add new project
        const { data, error } = await supabase
          .from('projects')
          .insert({
            project_title: currentProjectForm.project_title,
            status_id: currentProjectForm.status_id,
            type_id: currentProjectForm.type_id,
            timeframe: currentProjectForm.timeframe,
            description: currentProjectForm.description,
            link: currentProjectForm.link || null,
          })
          .select();
        projectResult = { data, error };
      }

      if (projectResult.error) {
        console.error('Error saving project:', projectResult.error);
        return;
      }

      console.log('Project saved successfully:', projectResult.data);

      if (projectResult.data && projectResult.data.length > 0) {
        const savedProjectId = projectResult.data[0].id;

        // Handle makers (delete existing and insert new ones for updates)
        if (editingProject) {
          const { error: deleteMakersError } = await supabase
            .from('project_makers')
            .delete()
            .eq('project_id', savedProjectId);
          if (deleteMakersError) console.error('Error deleting old makers:', deleteMakersError);
        }

        const makersToInsert = currentProjectForm.makers
          .map(makerId => {
            console.log('Processing makerId for insertion:', makerId, 'Parsed Int:', parseInt(makerId));
            return {
              project_id: savedProjectId,
              maker_id: parseInt(makerId),
            };
          });

        if (makersToInsert.length > 0) {
          console.log('Attempting to insert makers:', makersToInsert);
          const { error: projectMakersError } = await supabase
            .from('project_makers')
            .insert(makersToInsert);

          if (projectMakersError) {
            console.error('Error adding project makers to Supabase:', projectMakersError);
          }
        }

        // Re-fetch projects to update the list with the new/updated project and its relationships
        console.log('Re-fetching all projects...');
        const { data, error } = await supabase
          .from('projects')
          .select(
            `
            *,
            status:project_status(name),
            type:project_type(name),
            project_makers(maker_id)
            `
          );
        if (error) console.error('Error fetching projects after save:', error);
        else {
          setProjects(data as Project[] || []);
          console.log('Projects re-fetched and updated.', data);
        }
      }
    } catch (error) {
      console.error('An unexpected error occurred during project save:', error);
    }

    // Reset form and close modal
    setCurrentProjectForm({
      project_title: '',
      status_id: statuses[0]?.id || 0,
      type_id: types[0]?.id || 0,
      timeframe: '',
      description: '',
      makers: [],
      link: '',
    });
    setEditingProject(null);
    setShowAddForm(false);
  };

  

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="relative text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              MakerGram Archive
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A look into our journey of experimentation, collaboration, and community building.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md"
            aria-label="Toggle dark mode"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add New Project Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setEditingProject(null); // Clear any editing state
              setCurrentProjectForm({
                project_title: '',
                status_id: statuses[0]?.id || 0,
                type_id: types[0]?.id || 0,
                timeframe: '',
                description: '',
                makers: [],
                link: '',
              });
              setShowAddForm(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            disabled={isLoadingLookupData}
          >
            <Plus className="h-5 w-5" />
            Add New Project
          </button>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects and initiatives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Status Filters */}
            <div className="lg:w-64">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Status
              </h3>
              <div className="space-y-2">
                {statuses.map((status) => (
                  <label key={status.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusFilter.includes(status.name)}
                      onChange={() => toggleFilter(statusFilter, setStatusFilter, status.name)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      {getStatusIcon(status.name)} {status.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type Filters */}
            <div className="lg:w-64">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Type
              </h3>
              <div className="space-y-2">
                {types.map((type) => (
                  <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={typeFilter.includes(type.name)}
                      onChange={() => toggleFilter(typeFilter, setTypeFilter, type.name)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{type.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {statuses.sort((a, b) => {
            const order = ['Active', 'Hibernation', 'Completed', 'Graveyard'];
            return order.indexOf(a.name) - order.indexOf(b.name);
          }).map((status) => {
            const statusProjects = filteredProjects.filter(project => project.status.name === status.name);
            const statusConfig = {
              'Active': { icon: '🟢', color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
              'Hibernation': { icon: '🟡', color: 'yellow', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
              'Completed': { icon: '🔵', color: 'blue', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
              'Graveyard': { icon: '🔴', color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
            }[status.name];

            return (
              <div key={status.id} className="flex flex-col">
                {/* Column Header */}
                <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-lg p-4 mb-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(status.name)}</span>
                      <h2 className="text-lg font-semibold text-gray-900">{status.name}</h2>
                    </div>
                    <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-white text-${statusConfig.color}-700 border border-${statusConfig.color}-200`}>
                      {statusProjects.length}
                    </span>
                  </div>
                </div>

                {/* Project Cards */}
                <div className="space-y-4 flex-1">
                  {statusProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 overflow-hidden group"
                    >
                      <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2">
                            {project.project_title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(project)}
                              className="flex-shrink-0 p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-gray-50"
                              aria-label="Edit project"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
                            </button>
                            {project.link && (
                              <a
                                href={project.link}
                                className="flex-shrink-0 p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-gray-50"
                                aria-label="View project details"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Type Tag */}
                        <div className="mb-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(project.type.name)}`}>
                            {project.type.name}
                          </span>
                        </div>

                        {/* Date Range */}
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <Calendar className="h-3 w-3" />
                          {project.timeframe}
                        </div>

                        {/* Makers */}
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <Users className="h-3 w-3" />
                          <span className="truncate">
                            {project.project_makers && project.project_makers.length > 0
                              ? project.project_makers.map(pm => allMakers.find(m => m.id === pm.maker_id)?.name).filter(Boolean).join(', ')
                              : 'No makers assigned'}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed line-clamp-3">
                          {project.description}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Empty State for Column */}
                  {statusProjects.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <Search className="h-8 w-8 mx-auto" />
                      </div>
                      <p className="text-sm text-gray-500">
                        No {status.name.toLowerCase()} projects found
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Empty State */}
        {filteredProjects.length === 0 && searchTerm && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <Search className="h-12 w-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms to find what you're looking for.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={currentProjectForm.project_title}
                  onChange={(e) => setCurrentProjectForm({ ...currentProjectForm, project_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600"
                  placeholder="Enter project title"
                  required
                />
              </div>

              {/* Status and Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    value={currentProjectForm.status_id}
                    onChange={(e) => setCurrentProjectForm({ ...currentProjectForm, status_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600"
                  >
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {getStatusIcon(status.name)} {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type *
                  </label>
                  <select
                    value={currentProjectForm.type_id}
                    onChange={(e) => setCurrentProjectForm({ ...currentProjectForm, type_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600"
                  >
                    {types.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range *
                </label>
                <input
                  type="text"
                  value={currentProjectForm.timeframe}
                  onChange={(e) => setCurrentProjectForm({ ...currentProjectForm, timeframe: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600"
                  placeholder="e.g., Jan 2024 – Present"
                  required
                />
              </div>

              {/* Makers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Makers
                </label>
                <MultiSelectMakers
                  allMakers={allMakers}
                  selectedMakerIds={currentProjectForm.makers}
                  onSelectionChange={(selectedIds) =>
                    setCurrentProjectForm({ ...currentProjectForm, makers: selectedIds })
                  }
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={currentProjectForm.description}
                  onChange={(e) => setCurrentProjectForm({ ...currentProjectForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600"
                  placeholder="Describe the project, its goals, and current status..."
                  required
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link (optional)
                </label>
                <input
                  type="url"
                  value={currentProjectForm.link}
                  onChange={(e) => setCurrentProjectForm({ ...currentProjectForm, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitProject}
                disabled={!currentProjectForm.project_title || !currentProjectForm.timeframe || !currentProjectForm.description}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {editingProject ? 'Update Project' : 'Add Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;