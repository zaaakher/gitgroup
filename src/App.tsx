import React, { useState, useEffect } from "react";
import { Plus, Download, Upload, Trash2, FolderPlus } from "lucide-react";
import type { RepoList } from "./types";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  downloadJson,
} from "./lib/utils";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "./components/ui/select";
import { Button, buttonVariants } from "./components/ui/button";
import { Separator } from "./components/ui/separator";

function App() {
  const [repoList, setRepoList] = useState<RepoList>(() => {
    // Load from localStorage during initialization
    const savedData = loadFromLocalStorage();
    return (
      savedData || {
        title: "My Repository List",
        groups: [],
      }
    );
  });
  const [newGroupName, setNewGroupName] = useState("");
  const [newRepoUrl, setNewRepoUrl] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState("https://github.com/");

  useEffect(() => {
    // Only save to localStorage when repoList changes
    // and it's not the initial load
    saveToLocalStorage(repoList);
  }, [repoList]);

  const addGroup = () => {
    if (!newGroupName.trim()) return;
    setRepoList((prev) => ({
      ...prev,
      groups: [
        ...prev.groups,
        {
          id: crypto.randomUUID(),
          name: newGroupName,
          repositories: [],
        },
      ],
    }));
    setNewGroupName("");
  };

  const addRepository = () => {
    if (!newRepoUrl.trim() || !selectedGroupId) return;

    const fullUrl = `${selectedDomain}${newRepoUrl}`;

    setRepoList((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => {
        if (group.id === selectedGroupId) {
          return {
            ...group,
            repositories: [
              ...group.repositories,
              {
                id: crypto.randomUUID(),
                url: fullUrl,
                name: newRepoUrl,
                addedAt: new Date().toISOString(),
              },
            ],
          };
        }
        return group;
      }),
    }));
    setNewRepoUrl("");
  };

  const removeRepository = (groupId: string, repoId: string) => {
    setRepoList((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            repositories: group.repositories.filter(
              (repo) => repo.id !== repoId
            ),
          };
        }
        return group;
      }),
    }));
  };

  const removeGroup = (groupId: string) => {
    setRepoList((prev) => ({
      ...prev,
      groups: prev.groups.filter((group) => group.id !== groupId),
    }));
  };

  const handleExport = () => {
    downloadJson(repoList, "repository-list.json");
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
        console.error(error);
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  const updateTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepoList((prev) => ({ ...prev, title: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div>
          <Input
            type="text"
            value={repoList.title}
            onChange={updateTitle}
            className="text-2xl font-bold mb-4 p-4 h-14 w-full border-none focus:ring-0"
          />

          <div className="flex gap-4 mb-6">
            <Button onClick={handleExport}>
              <Download size={16} /> Export
            </Button>
            <label className={buttonVariants({ variant: "outline" })}>
              <Upload size={16} /> Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="New Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="h-10"
              />
              <Button onClick={addGroup}>
                <FolderPlus /> Create Group
              </Button>
            </div>

            <div className="flex flex-row gap-2 items-end">
              <div className="space-y-2 w-full">
                <Label htmlFor={"repo_name"}>Repository</Label>
                <div className="flex rounded-lg  shadow-black/5">
                  <div className="relative">
                    <Select
                      value={selectedDomain}
                      onValueChange={setSelectedDomain}
                    >
                      <SelectTrigger className="w-full rounded-e-none">
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="https://github.com/">
                          github.com/
                        </SelectItem>
                        <SelectItem value="https://gitlab.com/">
                          gitlab.com/
                        </SelectItem>
                        <SelectItem value="https://bitbucket.org/">
                          bitbucket.org/
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    id={"repo_name"}
                    className="-ms-px rounded-s-none shadow-none focus-visible:z-10 h-10 py-4"
                    placeholder="username/repository-name"
                    type="text"
                    value={newRepoUrl}
                    onChange={(e) => setNewRepoUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2 w-full max-w-[300px]">
                <Label htmlFor={"repo_name"}>Group</Label>
                <div className="flex rounded-lg  shadow-black/5">
                  <Select
                    value={selectedGroupId || ""}
                    onValueChange={(value) => setSelectedGroupId(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>

                    <SelectContent>
                      {repoList.groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={addRepository} disabled={!selectedGroupId}>
                <Plus size={16} /> Add Repo
              </Button>
            </div>
          </div>

          <div className="space-y-6 mt-4">
            {repoList.groups.map((group) => (
              <div key={group.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{group.name}</h3>
                  <Button
                    size="icon"
                    variant={"outline"}
                    onClick={() => removeGroup(group.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <Separator className="mb-4" />

                <div className="space-y-2">
                  {group.repositories.map((repo) => (
                    <div
                      key={repo.id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <div className="flex flex-row gap-4 items-center">
                        <img
                          src={`/${repo.url.split("/")[2].split(".")[0]}.png`}
                          alt={repo.url.split("/")[2]}
                          className="w-4 h-4"
                        />

                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {repo.name}
                        </a>
                      </div>
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
