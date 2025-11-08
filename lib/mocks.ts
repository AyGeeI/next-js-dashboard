// Zentralisierte Mock-Daten für das Dashboard

export const mockDashboardMetrics = [
  { title: "Erledigte Aufgaben", value: 18 },
  { title: "Aktive Projekte", value: 12 },
  { title: "Nächster Termin", value: "10:30 Uhr" },
  { title: "Offene Aufgaben", value: 24 },
];

export const mockWeatherData = {
  current: {
    temperature: 18,
    condition: "Teilweise bewölkt",
    humidity: 65,
    windSpeed: 12,
    location: "Berlin, Deutschland",
  },
  forecast: [
    { day: "Montag", temp: 19, condition: "Sonnig" },
    { day: "Dienstag", temp: 17, condition: "Bewölkt" },
    { day: "Mittwoch", temp: 15, condition: "Regen" },
    { day: "Donnerstag", temp: 20, condition: "Sonnig" },
    { day: "Freitag", temp: 22, condition: "Sonnig" },
  ],
};

export const mockFinanceData = {
  balance: 15420.5,
  income: 4250.0,
  expenses: 1890.25,
  transactions: [
    { id: 1, date: "2025-11-07", description: "Gehalt", amount: 4250.0, type: "income" },
    { id: 2, date: "2025-11-06", description: "Miete", amount: -950.0, type: "expense" },
    { id: 3, date: "2025-11-05", description: "Supermarkt", amount: -125.5, type: "expense" },
    { id: 4, date: "2025-11-04", description: "Freelance-Projekt", amount: 800.0, type: "income" },
    { id: 5, date: "2025-11-03", description: "Tankstelle", amount: -65.75, type: "expense" },
  ],
  savingsGoal: {
    target: 10000,
    current: 6450,
    percentage: 64.5,
  },
};

export const mockCalendarEvents = [
  {
    id: 1,
    title: "Team-Meeting",
    date: "2025-11-08",
    time: "10:00",
    duration: "60 Min",
    type: "meeting",
  },
  {
    id: 2,
    title: "Projekt-Review",
    date: "2025-11-08",
    time: "14:30",
    duration: "120 Min",
    type: "meeting",
  },
  {
    id: 3,
    title: "Arzttermin",
    date: "2025-11-09",
    time: "09:00",
    duration: "30 Min",
    type: "personal",
  },
  {
    id: 4,
    title: "Deadline: Feature X",
    date: "2025-11-10",
    time: "17:00",
    duration: "",
    type: "deadline",
  },
  {
    id: 5,
    title: "Kundengespräch",
    date: "2025-11-11",
    time: "11:00",
    duration: "60 Min",
    type: "meeting",
  },
];

export const mockChartData = [
  { label: "Jan", value: 65 },
  { label: "Feb", value: 72 },
  { label: "Mär", value: 58 },
  { label: "Apr", value: 80 },
  { label: "Mai", value: 75 },
  { label: "Jun", value: 90 },
];
