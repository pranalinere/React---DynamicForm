import './App.css';

import React, { useState, useEffect } from "react";

// Mock API response
const mockApi = (formType) => {
  const responses = {
    "User Information": {
      fields: [
        { name: "firstName", type: "text", label: "First Name", required: true },
        { name: "lastName", type: "text", label: "Last Name", required: true },
        { name: "age", type: "number", label: "Age", required: false },
      ],
    },
    "Address Information": {
      fields: [
        { name: "street", type: "text", label: "Street", required: true },
        { name: "city", type: "text", label: "City", required: false },
        {
          name: "state",
          type: "dropdown",
          label: "State",
          options: ["California", "Texas", "New York"],
          required: true,
        },
        { name: "zipCode", type: "text", label: "Zip Code", required: true },
      ],
    },
    "Payment Information": {
      fields: [
        { name: "cardNumber", type: "text", label: "Card Number", required: true },
        { name: "expiryDate", type: "date", label: "Expiry Date", required: true },
        { name: "cvv", type: "password", label: "CVV", required: true },
        { name: "cardholderName", type: "text", label: "Cardholder Name", required: true },
      ],
    },
  };
  return new Promise((resolve) => setTimeout(() => resolve(responses[formType]), 500));
};

const DynamicForm = () => {
  const [formType, setFormType] = useState("");
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [userInfoData, setUserInfoData] = useState([]);
  const [addressInfoData, setAddressInfoData] = useState([]);
  const [paymentInfoData, setPaymentInfoData] = useState([]);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState("");

  // Fetch form fields from the API
  useEffect(() => {
    if (formType) {
      setLoading(true);
      mockApi(formType)
        .then((response) => {
          setFormFields(response.fields);
          setFormData({});
          setErrors({});
          setProgress(0);
        })
        .catch(() => alert("Error loading form fields"))
        .finally(() => setLoading(false));
    }
  }, [formType]);


   // Handle form type change (reset submission success)
   const handleFormTypeChange = (e) => {
    setFormType(e.target.value);
    setSubmissionSuccess(false); // Hide success animation when form type changes
  };

  // Handle input changes
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))};

    // Update progress
    useEffect(() => {
      const requiredFields = formFields.filter((field) => field.required);
      const filledFields = requiredFields.filter((field) => formData[field.name]?.trim());
      const progressPercentage = Math.round((filledFields.length / requiredFields.length) * 100);
      setProgress(progressPercentage || 0); // Handle empty forms
    }, [formData, formFields]);

    const handleSubmit = (e) => {
      e.preventDefault();
      const validationErrors = {};
  
      // Validate fields
      formFields.forEach((field) => {
        if (field.required && !formData[field.name]?.trim()) {
          validationErrors[field.name] = `${field.label} is required`;
        }
      });
  
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      if (isEditing) {
        // Update existing data when editing
        if (formType === "User Information") {
          const updatedData = [...userInfoData];
          updatedData[editingIndex] = formData; // Update the item at the editingIndex
          setUserInfoData(updatedData);
        } else if (formType === "Address Information") {
          const updatedData = [...addressInfoData];
          updatedData[editingIndex] = formData; // Update the item at the editingIndex
          setAddressInfoData(updatedData);
        } else if (formType === "Payment Information") {
          const updatedData = [...paymentInfoData];
          updatedData[editingIndex] = formData; // Update the item at the editingIndex
          setPaymentInfoData(updatedData);
        }
  
        setIsEditing(true); // Reset editing mode
        alert("Changes saved successfully!"); 
        
      } else {
        // Add new data if not in editing mode
        if (formType === "User Information") {
          setUserInfoData([...userInfoData, formData]);
        } else if (formType === "Address Information") {
          setAddressInfoData([...addressInfoData, formData]);
        } else if (formType === "Payment Information") {
          setPaymentInfoData([...paymentInfoData, formData]);
        }
      }

      // Trigger the success animation
      setSubmissionSuccess(true);
  
      // Clear form after submission
      setFormData({});
      setErrors({});
      setEditingIndex(null);
      alert("Form submitted successfully!");
    };

  // Edit an entry
  const handleEdit = (formType, index) => {
    let updatedData;
    if (formType === "User Information") {
      updatedData = userInfoData[index];
    } else if (formType === "Address Information") {
      updatedData = addressInfoData[index];
    } else if (formType === "Payment Information") {
      updatedData = paymentInfoData[index];
    }
    setFormData(updatedData);
    setErrors({});
    setFormType(formType); // Set formType to prefill the form
    setIsEditing(true); // Set editing mode
    setEditingIndex(index); // Store the index of the item being edited
  };

  // Delete an entry
  const handleDelete = (formType, index) => {
    let updatedData;
    if (formType === "User Information") {
      updatedData = userInfoData.filter((_, i) => i !== index);
      setUserInfoData(updatedData);
    } else if (formType === "Address Information") {
      updatedData = addressInfoData.filter((_, i) => i !== index);
      setAddressInfoData(updatedData);
    } else if (formType === "Payment Information") {
      updatedData = paymentInfoData.filter((_, i) => i !== index);
      setPaymentInfoData(updatedData);
    }
    alert("Entry deleted successfully.");
  };

  const formatHeading = (heading) => {
    const formatted = heading
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/_/g, " ") // Replace underscores with spaces
      .toLowerCase() // Convert to lowercase
      .replace(/^\w/, (c) => c.toUpperCase()); // Capitalize the first letter
    return formatted;
  };
  

  return (
    <div className="container">
      <h1>Dynamic Form</h1>

      {/* Progress Bar */}
      <div className="progress-bar">
            <div style={{ width: `${progress}%` }}></div>
          </div>

      {/* Form Type Selection */}
      <div>
        <label htmlFor="formType">Select Form Type:</label>
        <select
          id="formType"
          value={formType}
          onChange={handleFormTypeChange} // Call to reset success message
        >
          <option value="">-- Select --</option>
          <option value="User Information">User Information</option>
          <option value="Address Information">Address Information</option>
          <option value="Payment Information">Payment Information</option>
        </select>
      </div>

      {loading && <p>Loading form...</p>}

      {/* Dynamic Form Fields */}
      {formFields.length > 0 && (
        <form onSubmit={handleSubmit}>
          {formFields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              {field.type === "dropdown" ? (
                <select
                  id={field.name}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  type={field.type}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                />
              )}
              {errors[field.name] && <p style={{ color: "red" }}>{errors[field.name]}</p>}
            </div>
          ))}

          

          <button type="submit">Submit</button>
        </form>
      )}

       {/* Success Message with Animation */}
        {submissionSuccess && (
        <div className="success-message">
          <span>Form submitted successfully!</span>
          <span className="checkmark">&#10003;</span> {/* Checkmark icon */}
        </div>
      )}  

      {/* Render Tables for Submitted Data */}
      {userInfoData.length > 0 && (
        <div>
          <h2>User Information Submitted Data</h2>
          <table>
            <thead>
              <tr>
                {Object.keys(userInfoData[0]).map((key) => (
                  <th key={key}>{formatHeading(key)}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userInfoData.map((data, index) => (
                <tr key={index}>
                  {Object.values(data).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                  <td>
                    <button onClick={() => handleEdit("User Information", index)}>Edit</button>
                    <button onClick={() => handleDelete("User Information", index)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {addressInfoData.length > 0 && (
        <div>
          <h2>Address Information Submitted Data</h2>
          <table>
            <thead>
              <tr>
                {Object.keys(addressInfoData[0]).map((key) => (
                  <th key={key}>{formatHeading(key)}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {addressInfoData.map((data, index) => (
                <tr key={index}>
                  {Object.values(data).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                  <td>
                    <button onClick={() => handleEdit("Address Information", index)}>Edit</button>
                    <button onClick={() => handleDelete("Address Information", index)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {paymentInfoData.length > 0 && (
        <div>
          <h2>Payment Information Submitted Data</h2>
          <table>
            <thead>
              <tr>
                {Object.keys(paymentInfoData[0]).map((key) => (
                  <th key={key}>{formatHeading(key)}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentInfoData.map((data, index) => (
                <tr key={index}>
                  {Object.values(data).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                  <td>
                    <button onClick={() => handleEdit("Payment Information", index)}>Edit</button>
                    <button onClick={() => handleDelete("Payment Information", index)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default DynamicForm;