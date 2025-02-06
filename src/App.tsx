import React, { useState, useEffect } from 'react';
import { Plus, Download, Upload, Save, Trash2, FolderPlus } from 'lucide-react';
import type { RepoList, Group, Repository } from './types';
import { saveToLocalStorage, loadFromLocalStorage, downloadJson } from './utils';

function App() {
  const [repoList, setRepoList] = useState<RepoList>({
    title: 'My Repository List',
    groups: []
  });
  const [newGroupName, setNewGroupName] = useState('');
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      setRepoList(savedData);
    }
  }, []);

  useEffect(() => {
    saveToLocalStorage(repoList);
  }, [repoList]);

  const addGroup = () => {
    if (!newGroupName.trim()) return;
    setRepoList(prev => ({
      ...prev,
      groups: [...prev.groups, {
        id: crypto.randomUUID(),
        name: newGroupName,
        repositories: []
      }]
    }));
    setNewGroupName('');
  };

  const addRepository = () => {
    if (!newRepoUrl.trim() || !selectedGroupId) return;
    setRepoList(prev => ({
      ...prev,
      groups: prev.groups.map(group => {
        if (group.id === selectedGroupId) {
          return {
            ...group,
            repositories: [...group.repositories, {
              id: crypto.randomUUID(),
              url: newRepoUrl,
              name: new URL(newRepoUrl).pathname.split('/').slice(-2).join('/'),
              addedAt: new Date().toISOString()
            }]
          };
        }
        return group;
      })
    }));
    setNewRepoUrl('');
  };

  const removeRepository = (groupId: string, repoId: string) => {
    setRepoList(prev => ({
      ...prev,
      groups: prev.groups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            repositories: group.repositories.filter(repo => repo.id !== repoId)
          };
        }
        return group;
      })
    }));
  };

  const removeGroup = (groupId: string) => {
    setRepoList(prev => ({
      ...prev,
      groups: prev.groups.filter(group => group.id !== groupId)
    }));
  };

  const handleExport = () => {
    downloadJson(repoList, 'repository-list.json');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setRepoList(imported);
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const updateTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepoList(prev => ({ ...prev, title: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <input
            type="text"
            value={repoList.title}
            onChange={updateTitle}
            className="text-2xl font-bold mb-4 w-full border-none focus:ring-0"
          />
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Download size={16} /> Export
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
              <Upload size={16} /> Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="flex-1 rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                onClick={addGroup}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                <FolderPlus size={16} /> Add Group
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-2">
              <select
                value={selectedGroupId || ''}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="flex-1 rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Group</option>
                {repoList.groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Repository URL"
                value={newRepoUrl}
                onChange={(e) => setNewRepoUrl(e.target.value)}
                className="flex-1 rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                onClick={addRepository}
                disabled={!selectedGroupId}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                <Plus size={16} /> Add Repo
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {repoList.groups.map(group => (
              <div key={group.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{group.name}</h3>
                  <button
                    onClick={() => removeGroup(group.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {group.repositories.map(repo => (
                    <div
                      key={repo.id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {repo.name}
                      </a>
                      <button
                        onClick={() => removeRepository(group.id, repo.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;