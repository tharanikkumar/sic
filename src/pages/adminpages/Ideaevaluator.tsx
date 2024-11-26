import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Topbar from '../../components/Topbar';
import axios from 'axios';
import { BACKEND_URL } from '../../../config';
import { Link } from 'react-router-dom';

const Ideaevaluator = () => {
  const [ideas, setIdeas] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvaluators, setSelectedEvaluators] = useState([]);
  const [currentIdeaId, setCurrentIdeaId] = useState(null);
  const [evaluators, setEvaluators] = useState([]);

 
  const fetchEvaluators = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}getevaluators.php`, { withCredentials: true });
      setEvaluators(response.data.evaluators);
    } catch (error) {
      console.error('Error fetching evaluators:', error);
    }
  };
  const downloadCSV = () => {
    if (evaluators.length === 0) return; // If no evaluators, don't attempt to download

    const csvData = convertToCSV(evaluators);

    // Create a Blob with the CSV data
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'evaluators.csv');
    document.body.appendChild(link); // Append link to body (not visible)
    link.click(); // Trigger download
    document.body.removeChild(link); // Clean up by removing the link
  };


  const convertToCSV = (data) => {
    const headers = Object.keys(data[0]).join(','); // Get column headers from the keys of the first object
    const rows = data.map((item) => Object.values(item).join(',')); // Get each row's values
    return [headers, ...rows].join('\n'); // Join headers and rows with new lines
  };

  const handleOpenDialog = (ideaId) => {
    setCurrentIdeaId(ideaId);
    setIsDialogOpen(true);
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedEvaluators([]);
  };

  // Handle the submit action when evaluators are selected
  const handleSubmit = () => {
    if (selectedEvaluators.length !== 3) {
      alert('You must select exactly 3 evaluators.');
      return;
    }

    axios
      .post(`${BACKEND_URL}map_evaluator_idea.php`, {
        idea_id: currentIdeaId,
        evaluator_ids: selectedEvaluators,
      }).then((response) => {
        console.log(response.data);
        if(response.data.success){
          alert('Evaluators assigned successfully');
        }
        
        setIsDialogOpen(false);
        setSelectedEvaluators([]);
      })
      .catch((error) => {
        console.error('Error assigning evaluators:', error);
        alert('Error assigning evaluators');
      });
  };

  
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}getideas.php`, { withCredentials: true });
        setIdeas(response.data.ideas);
      } catch (error) {
        console.error('Error fetching ideas:', error);
      }
    };

    fetchIdeas();
    fetchEvaluators();
  }, []);

  return (
    <div>
      <Navbar />
      <Topbar />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Admin Idea Evaluator</h1>
      </div>
      <div className="flex space-x-4 items-center mb-6">
      <button onClick={downloadCSV} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
        Download Evaluators as CSV
      </button>
      <button onClick={downloadCSV} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
       Upload Csv for adding Ideas and mapping
      </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mr-20 ml-20 mt-10 mb-6 bg-white rounded-lg overflow-hidden">
          <h2 className="text-2xl font-semibold mb-4">Idea Details</h2>
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="border px-4 py-2">Student Name</th>
                <th className="border px-4 py-2">Idea Title</th>
                <th className="border px-4 py-2">View</th>
                <th className="border px-4 py-2">Action</th>
                <th className="border px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {ideas.map((idea, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{idea.student_name}</td>
                  <td className="border px-4 py-2">{idea.idea_title}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <Link
                      to={`/detailedidea/${idea.id}`}
                      className="px-3 py-1 rounded bg-blue-100 text-blue-700"
                      onClick={() => console.log(idea)}
                    >
                      Detailed View
                    </Link>
                  </td>
                  <td className="border px-4 py-2 space-x-2">
                    {idea.assigned_count < 1 && (
                      <button
                        onClick={() => handleOpenDialog(idea.id)}
                        className="ml-2 px-3 py-1 rounded bg-yellow-100 text-yellow-700"
                      >
                        Assign Evaluators
                      </button>
                    )}
                    {idea.assigned_count === 3 && (
                      <button
                        className="ml-2 px-3 py-1 rounded bg-green-100 text-green-700"
                      >
                       Idea Assigned count =3
                      </button>
                    )}
                    {idea.assigned_count === 2 && (
                      <button
                        className="ml-2 px-3 py-1 rounded bg-green-100 text-green-700"
                      >
                       Idea Assigned count =2
                      </button>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {/* Check the status_id and display the appropriate status */}
                    {idea.status_id === 3 ? (
                      <span className="text-gray-500">Not Assigned</span>
                    ) : idea.status_id === 2 ? (
                      <span className="text-yellow-500">Not Evaluated</span>
                    ) : idea.status_id === 1 ? (
                      <span className="text-green-500">Recommended</span>
                    ) : 
                    idea.status_id === 0 ? (
                      <span className="text-red-500"> Not Recommended</span>
                    ) :(
                      <span className="text-red-400">Unknows status </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isDialogOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-96">
                <h2 className="text-xl mb-4">Assign Evaluators</h2>

                {/* Dropdown to select evaluators */}
                  <select
                    className="w-full border px-3 py-2 mb-4"
                    multiple
                    value={selectedEvaluators}
                    onChange={(e) => setSelectedEvaluators([...e.target.selectedOptions].map(option => option.value))}
                  >
                    <option value="">Select Evaluators (Choose 3)</option>
                    {evaluators.map((evaluator) => (
                      <option key={evaluator.id} value={evaluator.id}>
                        {evaluator.name}
                      </option>
                    ))}
                  </select>

                {/* Dialog actions */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleCloseDialog}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ideaevaluator;
