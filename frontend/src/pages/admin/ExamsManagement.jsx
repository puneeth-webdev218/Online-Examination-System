import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import useAuthStore from '../../context/authStore';
import { examService, studentService } from '../../services/api';
import { FiEdit2, FiTrash2, FiPlus, FiChevronLeft, FiBookmark } from 'react-icons/fi';

const ExamsManagement = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // selectedStudents removed from add/edit form; assignment handled from Exams list
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assigningExamId, setAssigningExamId] = useState(null);
    const [assignmentStudents, setAssignmentStudents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    totalMarks: '',
    perQuestionMarks: '',
    negativeMarking: '',
    totalQuestions: '',
    examDate: '',
    startTime: '',
    endTime: '',
    passingMarks: '',
  });

  useEffect(() => {
    fetchExams();
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await studentService.getAllStudents();
      setStudents(res.data.data);
    } catch (error) {
      toast.error('Failed to load students');
    }
  };

  const handleOpenAssignModal = (examId) => {
    setAssigningExamId(examId);
    setAssignmentStudents([]);
    setShowAssignModal(true);
  };

  const handleAssignStudents = async () => {
    try {
      if (assignmentStudents.length === 0) {
        toast.error('Please select at least one student');
        return;
      }
      await examService.assignExamToStudents(assigningExamId, assignmentStudents);
      toast.success('Exam assigned to students successfully');
      setShowAssignModal(false);
      setAssigningExamId(null);
      setAssignmentStudents([]);
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign exam');
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await examService.getAllExams();
      setExams(res.data.data);
    } catch (error) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        duration: parseInt(formData.duration),
        totalMarks: parseInt(formData.totalMarks),
        perQuestionMarks: parseInt(formData.perQuestionMarks),
        negativeMarking: parseInt(formData.negativeMarking),
        totalQuestions: parseInt(formData.totalQuestions),
        passingMarks: parseInt(formData.passingMarks),
      };

      if (editingId) {
        await examService.updateExam(editingId, data);
        toast.success('Exam updated successfully');
      } else {
        await examService.createExam(data);
        toast.success('Exam created successfully');
      }

      setFormData({
        title: '',
        description: '',
        duration: '',
        totalMarks: '',
        perQuestionMarks: '',
        negativeMarking: '',
        totalQuestions: '',
        examDate: '',
        startTime: '',
        endTime: '',
        passingMarks: '',
      });
      setShowForm(false);
      setEditingId(null);
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await examService.deleteExam(id);
        toast.success('Exam deleted successfully');
        fetchExams();
      } catch (error) {
        toast.error('Failed to delete exam');
      }
    }
  };

  const handleEdit = (exam) => {
    setFormData({
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      perQuestionMarks: exam.perQuestionMarks,
      negativeMarking: exam.negativeMarking,
      totalQuestions: exam.totalQuestions,
      examDate: exam.examDate.split('T')[0],
      startTime: exam.startTime,
      endTime: exam.endTime,
      passingMarks: exam.passingMarks,
    });
    setEditingId(exam._id);
    setShowForm(true);
  };


  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        title="Exams Management"
        user={user}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-700"
        >
          <FiChevronLeft /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Exams</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                title: '',
                description: '',
                duration: '',
                totalMarks: '',
                perQuestionMarks: '',
                negativeMarking: '',
                totalQuestions: '',
                examDate: '',
                startTime: '',
                endTime: '',
                passingMarks: '',
              });
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <FiPlus /> {showForm ? 'Cancel' : 'Add Exam'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Exam' : 'Add New Exam'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Exam Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="number"
                  name="duration"
                  placeholder="Duration (minutes)"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="number"
                  name="totalMarks"
                  placeholder="Total Marks"
                  value={formData.totalMarks}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="number"
                  name="perQuestionMarks"
                  placeholder="Marks per Question"
                  value={formData.perQuestionMarks}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="number"
                  name="negativeMarking"
                  placeholder="Negative Marking"
                  value={formData.negativeMarking}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="number"
                  name="totalQuestions"
                  placeholder="Total Questions"
                  value={formData.totalQuestions}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="number"
                  name="passingMarks"
                  placeholder="Passing Marks"
                  value={formData.passingMarks}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Student assignment removed from add/edit form — use Assign Students button on exam cards */}

              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                {editingId ? 'Update' : 'Create'} Exam
              </button>
            </form>
          </div>
        )}

        {/* Exams Grid */}
                {/* Assignment Modal */}
                {showAssignModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                      <h2 className="text-xl font-bold mb-4 text-gray-900">Assign Exam to Students</h2>

                      <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto mb-4">
                        {students.length === 0 ? (
                          <p className="text-gray-500">No students available</p>
                        ) : (
                          students.map((student) => (
                            <label
                              key={student._id}
                              className="flex items-center gap-2 mb-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={assignmentStudents.includes(student._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssignmentStudents([...assignmentStudents, student._id]);
                                  } else {
                                    setAssignmentStudents(
                                      assignmentStudents.filter((id) => id !== student._id)
                                    );
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-gray-700">
                                {student.name} ({student.email})
                              </span>
                            </label>
                          ))
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowAssignModal(false)}
                          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAssignStudents}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  </div>
                )}
        {exams.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No exams found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam) => (
              <div
                key={exam._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FiBookmark /> {exam.title}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(exam)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(exam._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-semibold">{exam.duration} min</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Marks</p>
                    <p className="font-semibold">{exam.totalMarks}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Questions</p>
                    <p className="font-semibold">{exam.totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Per Q Marks</p>
                    <p className="font-semibold">{exam.perQuestionMarks}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/admin/questions/${exam._id}`)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Manage Questions
                </button>

                <button
                  onClick={() => handleOpenAssignModal(exam._id)}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition text-sm mt-2"
                >
                  Assign Students
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ExamsManagement;
