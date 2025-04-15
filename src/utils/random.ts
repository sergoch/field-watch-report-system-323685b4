
// Utility functions to generate random data

export const randomSalary = (): number => {
  return Math.floor(Math.random() * (150 - 40) + 40);
};

export const randomPosition = (): string => {
  const positions = [
    "Engineer",
    "Technician",
    "Supervisor",
    "Laborer",
    "Driver",
    "Operator",
    "Assistant"
  ];
  return positions[Math.floor(Math.random() * positions.length)];
};
