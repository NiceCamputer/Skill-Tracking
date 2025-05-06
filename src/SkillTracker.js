import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, PlusCircle, Save, Award, History } from 'lucide-react';

export default function SkillTracker() {
  // Define skill mastery levels
  const masteryLevels = [
    { hours: 0, title: "Complete Beginner" },
    { hours: 1, title: "Complete Noob" },
    { hours: 10, title: "Noob" },
    { hours: 25, title: "Novice" },
    { hours: 50, title: "Amateur" },
    { hours: 100, title: "Apprentice" },
    { hours: 250, title: "Intermediate" },
    { hours: 500, title: "Advanced" },
    { hours: 1000, title: "Master" },
    { hours: 2500, title: "Grand Master" },
    { hours: 5000, title: "Expert" },
    { hours: 10000, title: "Dedicated Expert" }
  ];

  // State variables
  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [timeToAdd, setTimeToAdd] = useState('');
  const [timeUnit, setTimeUnit] = useState('hours');
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('skills');

  // Load saved data on component mount
  useEffect(() => {
    const savedSkills = localStorage.getItem('skills');
    if (savedSkills) {
      setSkills(JSON.parse(savedSkills));
    }
  }, []);

  // Save data whenever skills change
  useEffect(() => {
    localStorage.setItem('skills', JSON.stringify(skills));
  }, [skills]);

  // Get mastery title based on hours
  const getMasteryTitle = (hours) => {
    for (let i = masteryLevels.length - 1; i >= 0; i--) {
      if (hours >= masteryLevels[i].hours) {
        return masteryLevels[i].title;
      }
    }
    return masteryLevels[0].title;
  };

  // Get next mastery level
  const getNextMasteryLevel = (hours) => {
    for (let i = 0; i < masteryLevels.length; i++) {
      if (hours < masteryLevels[i].hours) {
        return {
          title: masteryLevels[i].title,
          hours: masteryLevels[i].hours,
          hoursRemaining: masteryLevels[i].hours - hours
        };
      }
    }
    return null; // Already at max level
  };

  // Add a new skill
  const addSkill = () => {
    if (newSkillName.trim() === '') return;
    
    const newSkill = {
      id: Date.now(),
      name: newSkillName.trim(),
      hours: 0,
      history: []
    };
    
    setSkills([...skills, newSkill]);
    setNewSkillName('');
  };

  // Add time to a skill
  const addTimeToSkill = () => {
    if (!selectedSkill || !timeToAdd || isNaN(parseFloat(timeToAdd))) return;
    
    const time = parseFloat(timeToAdd);
    const hoursToAdd = timeUnit === 'minutes' ? time / 60 : time;
    
    const updatedSkills = skills.map(skill => {
      if (skill.id === selectedSkill) {
        const newEntry = {
          timestamp: new Date().toISOString(),
          hoursAdded: hoursToAdd,
          totalHours: skill.hours + hoursToAdd
        };
        
        return {
          ...skill,
          hours: skill.hours + hoursToAdd,
          history: [...skill.history, newEntry]
        };
      }
      return skill;
    });
    
    setSkills(updatedSkills);
    setTimeToAdd('');
  };

  // Format time display
  const formatTime = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (wholeHours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${wholeHours} hr`;
    } else {
      return `${wholeHours} hr ${minutes} min`;
    }
  };

  // Format date for history
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate progress to next level as percentage
  const calculateProgress = (hours) => {
    const currentLevel = masteryLevels.findIndex((level, index, array) => {
      return hours >= level.hours && (index === array.length - 1 || hours < array[index + 1].hours);
    });
    
    if (currentLevel === masteryLevels.length - 1) return 100;
    
    const currentLevelHours = masteryLevels[currentLevel].hours;
    const nextLevelHours = masteryLevels[currentLevel + 1].hours;
    const progress = ((hours - currentLevelHours) / (nextLevelHours - currentLevelHours)) * 100;
    
    return Math.min(progress, 100);
  };

  // Get chart data
  const getChartData = () => {
    if (!skills || skills.length === 0) return [];
    
    return skills.map(skill => ({
      name: skill.name.length > 10 ? skill.name.substring(0, 10) + '...' : skill.name,
      hours: skill.hours
    }));
  };

  // View skill history
  const viewSkillHistory = (skillId) => {
    setSelectedSkill(skillId);
    setShowHistory(true);
    setActiveTab('history');
  };

  // Render the selected skill's history
  const renderSkillHistory = () => {
    const skill = skills.find(s => s.id === selectedSkill);
    if (!skill) return null;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">{skill.name} History</h3>
        <div className="overflow-y-auto max-h-96">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Time Added</th>
                <th className="p-2 text-left">Total Time</th>
              </tr>
            </thead>
            <tbody>
              {skill.history.length > 0 ? (
                [...skill.history].reverse().map((entry, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="p-2">{formatDate(entry.timestamp)}</td>
                    <td className="p-2">{formatTime(entry.hoursAdded)}</td>
                    <td className="p-2">{formatTime(entry.totalHours)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-2 text-center">No history recorded yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <button 
          onClick={() => {
            setShowHistory(false);
            setActiveTab('skills');
          }}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Skills
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Skill Mastery Tracker</h1>
        
        {/* Navigation Tabs */}
        <div className="flex mb-6 bg-white rounded-lg shadow">
          <button 
            className={`flex-1 py-3 px-4 ${activeTab === 'skills' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            Skills
          </button>
          <button 
            className={`flex-1 py-3 px-4 ${activeTab === 'add' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            Add Skill
          </button>
          <button 
            className={`flex-1 py-3 px-4 ${activeTab === 'log' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('log')}
          >
            Log Time
          </button>
          <button 
            className={`flex-1 py-3 px-4 ${activeTab === 'chart' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('chart')}
          >
            Chart
          </button>
        </div>
        
        {/* Show History View */}
        {showHistory && (
          <div className="mb-6">
            {renderSkillHistory()}
          </div>
        )}
        
        {/* Skills List */}
        {activeTab === 'skills' && !showHistory && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Skills</h2>
            
            {skills.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500">You haven't added any skills yet.</p>
                <button 
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => setActiveTab('add')}
                >
                  Add Your First Skill
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map(skill => {
                  const masteryTitle = getMasteryTitle(skill.hours);
                  const nextLevel = getNextMasteryLevel(skill.hours);
                  const progress = calculateProgress(skill.hours);
                  
                  return (
                    <div key={skill.id} className="bg-white p-4 rounded-lg shadow-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{skill.name}</h3>
                          <div className="text-sm text-gray-500">
                            {formatTime(skill.hours)} logged
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedSkill(skill.id);
                              setActiveTab('log');
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Log Time"
                          >
                            <Clock size={20} />
                          </button>
                          <button 
                            onClick={() => viewSkillHistory(skill.id)}
                            className="text-blue-500 hover:text-blue-700"
                            title="View History"
                          >
                            <History size={20} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <div className="flex items-center">
                          <Award size={18} className="text-yellow-500 mr-2" />
                          <span className="font-medium">{masteryTitle}</span>
                        </div>
                        
                        {nextLevel && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Next: {nextLevel.title}</span>
                              <span>{formatTime(nextLevel.hoursRemaining)} remaining</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-500 h-2.5 rounded-full" 
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* Add New Skill Form */}
        {activeTab === 'add' && !showHistory && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Skill</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Enter skill name"
                className="flex-1 p-2 border border-gray-300 rounded"
              />
              <button
                onClick={addSkill}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center"
                disabled={newSkillName.trim() === ''}
              >
                <PlusCircle size={18} className="mr-1" />
                Add Skill
              </button>
            </div>
          </div>
        )}
        
        {/* Log Time Form */}
        {activeTab === 'log' && !showHistory && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Log Time</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Select Skill</label>
                <select
                  value={selectedSkill || ''}
                  onChange={(e) => setSelectedSkill(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">-- Select a skill --</option>
                  {skills.map(skill => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Time</label>
                  <input
                    type="number"
                    value={timeToAdd}
                    onChange={(e) => setTimeToAdd(e.target.value)}
                    placeholder="Enter time"
                    className="w-full p-2 border border-gray-300 rounded"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 font-medium">Unit</label>
                  <select
                    value={timeUnit}
                    onChange={(e) => setTimeUnit(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="hours">Hours</option>
                    <option value="minutes">Minutes</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={addTimeToSkill}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center"
                disabled={!selectedSkill || !timeToAdd || isNaN(parseFloat(timeToAdd))}
              >
                <Save size={18} className="mr-1" />
                Log Time
              </button>
            </div>
          </div>
        )}
        
        {/* Chart View */}
        {activeTab === 'chart' && !showHistory && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Skill Progress Chart</h2>
            
            {skills.length === 0 ? (
              <p className="text-center text-gray-500">Add skills to see your progress chart</p>
            ) : (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getChartData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                      interval={0}
                    />
                    <YAxis name="Hours" />
                    <Tooltip 
                      formatter={(value) => [`${formatTime(value)}`, "Time Spent"]}
                      labelFormatter={(label) => label}
                    />
                    <Legend />
                    <Bar dataKey="hours" name="Hours" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Mastery Levels</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {masteryLevels.map((level, idx) => (
                  <div key={idx} className="flex items-center">
                    <Award size={16} className="text-yellow-500 mr-1" />
                    <span>{level.title}: {formatTime(level.hours)}+</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
