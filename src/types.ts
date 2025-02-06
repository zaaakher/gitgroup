export interface Repository {
  id: string;
  url: string;
  name: string;
  addedAt: string;
}

export interface Group {
  id: string;
  name: string;
  repositories: Repository[];
}

export interface RepoList {
  title: string;
  groups: Group[];
}