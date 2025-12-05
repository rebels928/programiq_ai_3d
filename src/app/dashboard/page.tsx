'use client'

import { useRouter } from 'next/navigation'
import { useUser, UserButton } from '@clerk/nextjs'
import { Plus, Building2, Calendar, DollarSign, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export default function DashboardPage() {
  const { user } = useUser()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  // Mock projects data (will be replaced with Supabase in later phase)
  const projects = [
    {
      id: '1',
      name: 'Sunset Heights Residences',
      location: 'San Francisco, CA',
      phase: 'Foundation',
      budget: '$2.4M',
      completion: 35,
      lastUpdated: '2 days ago'
    },
    {
      id: '2',
      name: 'Marina Bay Office Complex',
      location: 'Oakland, CA',
      phase: 'Framing',
      budget: '$5.8M',
      completion: 62,
      lastUpdated: '5 hours ago'
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Top Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">PROGRAMIQ</h1>
            <span className="text-sm text-slate-600 dark:text-slate-400">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {user?.firstName || user?.emailAddresses[0]?.emailAddress}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Your Projects</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and visualize your construction projects
          </p>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Project Card */}
          <button
            onClick={() => alert('Create project functionality coming in Phase 2+')}
            className="group border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center gap-4 min-h-[280px] hover:border-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
              <Plus className="w-8 h-8 text-slate-500 dark:text-slate-400 group-hover:text-cyan-500 transition-colors" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                Create New Project
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Start a new construction project
              </p>
            </div>
          </button>

          {/* Existing Projects */}
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => router.push(`/project/${project.id}`)}
              className="group bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                    <Building2 className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{project.location}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Current Phase</span>
                  <span className="text-slate-900 dark:text-white font-medium">{project.phase}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Budget
                  </span>
                  <span className="text-slate-900 dark:text-white font-medium">{project.budget}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Updated
                  </span>
                  <span className="text-slate-900 dark:text-white font-medium">{project.lastUpdated}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Progress</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{project.completion}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${project.completion}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
