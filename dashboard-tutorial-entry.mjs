export function syncDashboardTutorialEntry(document, { enabled, dashboard, count = 0 }) {
  const header = document.querySelector('.topbar');
  header?.classList.toggle('gcTeacherDashboard', Boolean(enabled && dashboard));
  const button = document.getElementById('gradecrewTourBtn');
  const userBar = document.getElementById('userBar');
  if (!button || !userBar) return;
  const label = document.getElementById('userLabel');
  if (button.parentElement !== userBar || button.nextElementSibling !== label) userBar.insertBefore(button, label);
  button.hidden = !enabled || !dashboard || Number(count) > 5;
}
