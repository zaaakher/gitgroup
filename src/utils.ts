export const saveToLocalStorage = (data: any) => {
  localStorage.setItem('repoManager', JSON.stringify(data));
};

export const loadFromLocalStorage = () => {
  const data = localStorage.getItem('repoManager');
  return data ? JSON.parse(data) : null;
};

export const downloadJson = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};