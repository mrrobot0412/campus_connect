import React, { useState, useEffect } from "react";
import { ChevronDown, Search, BookOpen, Users, Clock } from "lucide-react";
import { FiUser } from "react-icons/fi";

const departments = ["CSED", "ECED"];

const Hero = () => {
  const [department, setDepartment] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchType, setSearchType] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem("auth-token");
    if (storedToken) {
      setToken(storedToken);
    }
    
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedToken = localStorage.getItem("auth-token");
      if (!storedToken) return;
      
      const response = await fetch("http://localhost:8000/api/v1/studentRoutes/getStudent", {
        headers: {
          "auth-token": storedToken
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserName(data.student?.firstName || "Guest");
        setStudentId(data.student?._id || "");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserName("Guest");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim() && !department) return;
    
    setIsLoading(true);
    try {
      let url = "http://localhost:8000/api/v1/teachersRoutes/getTeachers?";
      
      if (searchTerm.trim()) {
        url += `search=${encodeURIComponent(searchTerm)}`;
      }
      
      if (department) {
        url += `${searchTerm.trim() ? "&" : ""}department=${encodeURIComponent(department)}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      setSearchResults(data.teachers || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpecialSearch = async (type) => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      let url = "http://localhost:8000/api/v1/teachersRoutes/";
      
      switch (type) {
        case "specialization":
          url += `searchBySpecialization?q=${encodeURIComponent(searchTerm)}`;
          break;
        case "paper":
          url += `searchByPaper?q=${encodeURIComponent(searchTerm)}`;
          break;
        case "availability":
          url += `searchByAvailability?date=${encodeURIComponent(searchTerm)}`;
          break;
        default:
          url += `getTeachers?search=${encodeURIComponent(searchTerm)}`;
      }
      
      if (department) {
        url += `&department=${encodeURIComponent(department)}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      setSearchResults(data.teachers || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSlot = async (teacherId, slotId) => {
    if (!token) {
      alert("Please login to book a slot");
      return;
    }
    
    try {
      const res = await fetch("http://localhost:8000/api/v1/studentRoutes/bookSlot", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "auth-token": token
        },
        body: JSON.stringify({ 
          teacherId, 
          slotId,
          studentId
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert("Slot booked successfully!");
        setSelectedTeacher(null);
        
        // Refresh search results
        if (searchType === "general") {
          handleSearch();
        } else {
          handleSpecialSearch(searchType);
        }
      } else {
        alert(data.error || "Failed to book slot");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to book slot. Please try again.");
    }
  };

  const handleTeacherClick = async (teacherId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/teachersRoutes/getTeacher/${teacherId}`);
      const data = await res.json();
      
      if (res.ok) {
        setSelectedTeacher(data.teacher);
      } else {
        alert(data.error || "Failed to load teacher details");
      }
    } catch (error) {
      console.error("Error fetching teacher details:", error);
      alert("Failed to load teacher details. Please try again.");
    }
  };

  return (
    <section className="w-full min-h-screen bg-gray-100 flex flex-col">
      <header className="w-full flex justify-between items-center px-8 py-4 bg-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full">
            <FiUser className="w-6 h-6 text-gray-600" />
          </div>
          <span className="text-lg font-semibold text-gray-800">{userName}</span>
        </div>
        <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition">Logout</button>
      </header>

      <main className="flex-grow flex flex-col items-center px-4 pt-8 w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Student Dashboard</h1>

        {/* Search Box */}
        <div className="mt-6 flex flex-col w-full max-w-4xl bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <input
              type="text"
              placeholder="Search for teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg shadow-sm"
            />
            <button
              onClick={() => {
                setSearchType("general");
                handleSearch();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Search size={18} /> Search
            </button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => {
                setSearchType("specialization");
                handleSpecialSearch("specialization");
              }}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                searchType === "specialization" 
                  ? "bg-green-600 text-white" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <Users size={16} /> By Specialization
            </button>
            <button
              onClick={() => {
                setSearchType("paper");
                handleSpecialSearch("paper");
              }}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                searchType === "paper" 
                  ? "bg-green-600 text-white" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <BookOpen size={16} /> By Research Paper
            </button>
            <button
              onClick={() => {
                setSearchType("availability");
                handleSpecialSearch("availability");
              }}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                searchType === "availability" 
                  ? "bg-green-600 text-white" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <Clock size={16} /> By Availability
            </button>
          </div>
        </div>

        {/* Department Dropdown */}
        <div className="relative inline-block text-left mt-6">
          <button
            className="inline-flex justify-between items-center w-60 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {department || "Select Department"} <ChevronDown className="ml-2" />
          </button>

          {dropdownOpen && (
            <div className="mt-2 absolute w-60 bg-white rounded-lg shadow-lg z-10">
              <button
                key="all"
                onClick={() => {
                  setDepartment("");
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  department === "" ? "font-semibold text-blue-600" : "text-gray-800"
                }`}
              >
                All Departments
              </button>
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => {
                    setDepartment(dept);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                    department === dept ? "font-semibold text-blue-600" : "text-gray-800"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mt-8 w-full max-w-6xl text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Searching...</p>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && searchResults.length > 0 && (
          <div className="mt-8 w-full max-w-6xl bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Results {searchType !== "general" && `- ${searchType === "specialization" ? "By Specialization" : searchType === "paper" ? "By Research Paper" : "By Availability"}`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((prof) => (
                <div
                  key={prof._id}
                  className="border rounded-lg p-4 shadow-md bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => handleTeacherClick(prof._id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {prof.firstName?.[0] || "?"}{prof.lastName?.[0] || "?"}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">{prof.firstName} {prof.lastName}</h3>
                      <p className="text-sm text-gray-600">{prof.department}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Room:</span> {prof.roomNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Specialization:</span> {Array.isArray(prof.specialization) ? prof.specialization.join(", ") : "Not specified"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Papers:</span> {prof.papers && prof.papers.length > 0 ? 
                          (prof.papers.length > 2 ? 
                            `${prof.papers[0].title || prof.papers[0]}, ${prof.papers[1].title || prof.papers[1]}, +${prof.papers.length - 2} more` :
                            prof.papers.map(p => p.title || p).join(", ")) : 
                          "None"}
                      </p>
                      <div className="mt-3 flex items-center">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {prof.slots?.filter(s => s.status === "available").length || 0} slots available
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {!isLoading && searchTerm && searchResults.length === 0 && (
          <div className="mt-8 w-full max-w-6xl bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-600">No results found. Try a different search term.</p>
          </div>
        )}

        {/* Booking Modal */}
        {selectedTeacher && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">Book Meeting with {selectedTeacher.firstName} {selectedTeacher.lastName}</h2>
                  <p className="text-gray-600">{selectedTeacher.department} • Room {selectedTeacher.roomNumber}</p>
                  <p className="text-gray-600 mt-1">
                    {Array.isArray(selectedTeacher.specialization) ? selectedTeacher.specialization.join(", ") : ""}
                  </p>
                </div>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedTeacher(null)}
                >
                  &times;
                </button>
              </div>
              
              {selectedTeacher.slots?.filter(s => s.status === "available").length > 0 ? (
                <>
                  <p className="mb-2 text-sm text-gray-600">Select an available time slot:</p>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedTeacher.slots
                        .filter(s => s.status === "available")
                        .map((slot, i) => {
                          const slotDate = new Date(slot.time);
                          return (
                            <button 
                              key={i} 
                              className="p-3 border rounded-md text-left hover:bg-blue-50 transition"
                              onClick={() => handleBookSlot(selectedTeacher._id, slot._id)}
                            >
                              <div className="font-medium">{slotDate.toLocaleDateString()}</div>
                              <div className="text-sm text-gray-600">{slotDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center py-8 text-gray-600">No available slots at the moment.</p>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                  onClick={() => setSelectedTeacher(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </section>
  );
};

export default Hero;