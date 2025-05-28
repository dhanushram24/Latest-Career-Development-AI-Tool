import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface EmployeeData {
  Name: string;
  Domain: string;
  Category: string;
  'Sub Category': string;
  'Skill Rate': number;
  'Interest Rate': number;
  Access: string;
  Email: string;
}

interface VisualizationData {
  type: 'bar_chart' | 'pie_chart' | 'radar_chart' | 'heatmap';
  title: string;
  data: any;
}

interface EmployeeDataCardProps {
  data: {
    employees: EmployeeData[];
  };
  visualizations?: VisualizationData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

const HeatmapChart: React.FC<{ data: any; title: string }> = ({ data, title }) => {
  const { matrix, xLabels, yLabels, xTitle, yTitle } = data;
  
  // Find max value for color scaling
  const maxValue = Math.max(...matrix.flat());
  
  return (
    <div className="bg-white p-4 rounded-lg border">
      <h4 className="font-semibold text-lg text-gray-800 mb-4 text-center">{title}</h4>
      <div className="relative">
        <div className="grid grid-cols-6 gap-1 text-xs">
          <div></div>
          {xLabels.map((label, idx) => (
            <div key={idx} className="text-center font-medium text-gray-600 p-1">
              {label}
            </div>
          ))}
          {matrix.map((row, rowIdx) => (
            <React.Fragment key={rowIdx}>
              <div className="text-right font-medium text-gray-600 p-1 flex items-center justify-end">
                {yLabels[rowIdx]}
              </div>
              {row.map((value, colIdx) => {
                const intensity = maxValue > 0 ? value / maxValue : 0;
                const backgroundColor = `rgba(59, 130, 246, ${0.1 + intensity * 0.8})`;
                return (
                  <div
                    key={colIdx}
                    className="aspect-square flex items-center justify-center text-xs font-medium border rounded"
                    style={{ backgroundColor }}
                    title={`${yTitle}: ${yLabels[rowIdx]}, ${xTitle}: ${xLabels[colIdx]}, Count: ${value}`}
                  >
                    {value > 0 ? value : ''}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-2 text-center text-xs text-gray-500">
          <span className="block">{xTitle} →</span>
          <span className="block">↑ {yTitle}</span>
        </div>
      </div>
    </div>
  );
};

export const EmployeeDataCard: React.FC<EmployeeDataCardProps> = ({ data, visualizations }) => {
  if (!data?.employees || !Array.isArray(data.employees)) return null;

  const renderVisualization = (viz: VisualizationData, index: number) => {
    switch (viz.type) {
      case 'bar_chart':
        const barData = viz.data.labels.map((label: string, idx: number) => ({
          name: label,
          value: viz.data.datasets[0].data[idx]
        }));
        
        return (
          <div key={index} className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-lg text-gray-800 mb-4 text-center">{viz.title}</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [value, 'Employees']}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'pie_chart':
        const pieData = viz.data.labels.map((label: string, idx: number) => ({
          name: label,
          value: viz.data.datasets[0].data[idx]
        }));
        
        return (
          <div key={index} className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-lg text-gray-800 mb-4 text-center">{viz.title}</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Employees']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case 'radar_chart':
        const radarData = viz.data.labels.map((label: string, idx: number) => ({
          subject: label,
          value: viz.data.datasets[0].data[idx],
          fullMark: Math.max(...viz.data.datasets[0].data) * 1.2
        }));
        
        return (
          <div key={index} className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-lg text-gray-800 mb-4 text-center">{viz.title}</h4>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} fontSize={10} />
                <Radar
                  name="Employees"
                  dataKey="value"
                  stroke="#22C55E"
                  fill="#22C55E"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip formatter={(value) => [value, 'Employees']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'heatmap':
        return <HeatmapChart key={index} data={viz.data} title={viz.title} />;

      default:
        return null;
    }
  };

  const getSkillLevelColor = (skillRate: number) => {
    if (skillRate >= 4) return 'text-green-600 bg-green-50';
    if (skillRate >= 3) return 'text-blue-600 bg-blue-50';
    if (skillRate >= 2) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getInterestLevelColor = (interestRate: number) => {
    if (interestRate >= 4) return 'text-purple-600 bg-purple-50';
    if (interestRate >= 3) return 'text-indigo-600 bg-indigo-50';
    if (interestRate >= 2) return 'text-gray-600 bg-gray-50';
    return 'text-orange-600 bg-orange-50';
  };

  return (
    <div className="space-y-6">
      {/* Visualizations Section */}
      {visualizations && visualizations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h3 className="font-semibold text-lg text-gray-800">Data Visualizations</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visualizations.map((viz, index) => renderVisualization(viz, index))}
          </div>
        </div>
      )}

      {/* Employee Data Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg text-gray-800">
              Employee Results ({data.employees.length})
            </h4>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>High Skill (4-5)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>High Interest (4-5)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-1 p-4">
            {data.employees.map((employee, index) => (
              <div key={index} className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-semibold text-gray-900">{employee.Name}</span>
                      <span className="text-sm text-gray-500">({employee.Domain})</span>
                      {employee.Access === 'admin' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border">
                        {employee['Sub Category']}
                      </span>
                      <span className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-600">
                        {employee.Category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(employee['Skill Rate'])}`}>
                      Skill: {employee['Skill Rate']}/5
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getInterestLevelColor(employee['Interest Rate'])}`}>
                      Interest: {employee['Interest Rate']}/5
                    </div>
                  </div>
                </div>
                
                {/* Progress bars for visual representation */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-600 w-12">Skill</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(employee['Skill Rate'] / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{employee['Skill Rate']}/5</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-600 w-12">Interest</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(employee['Interest Rate'] / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{employee['Interest Rate']}/5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {data.employees.length > 10 && (
          <div className="p-4 border-t border-gray-200 text-center">
            <span className="text-sm text-gray-500">
              Showing first 10 of {data.employees.length} employees
            </span>
          </div>
        )}
      </div>
    </div>
  );
};