"use client";

import React, { useState } from "react";

export default function Login() {
  const [inputValue, setInputValue] = useState("");

  //
  // Handle Input Change
  //
  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };

  //
  // Save Password
  //
  const savePassword = (e: any) => {
    e.preventDefault();

    // Store the inputValue in local storage
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", inputValue);
    }

    // Redirect to the home page
    window.location.href = "/";
  };

  return (
    <div className="container mx-auto p-20">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <form className="flex flex-col space-y-4" onSubmit={savePassword}>
        <label className="flex flex-col">
          <span className="text-xl">Password</span>
          <input type="password" value={inputValue} onChange={handleInputChange} className="border border-gray-400 p-2" />
        </label>
        <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
