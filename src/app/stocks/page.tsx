"use client";

import { useState, useEffect, ChangeEvent } from "react";

type TableRow = {
  symbol: string;
  bid_price: number;
  last_fill: number;
  diff: number;
};

var bearerToken = "";

if (typeof window !== "undefined") {
  bearerToken = localStorage.getItem("access_token") || "";
}

export default function Home() {
  const [rows, setRows] = useState<TableRow[]>([]);
  const [fetchBtnText, setFetchBtnText] = useState<string>("Fetch Data");

  //
  // Fetch data from API
  //
  const fetchData = () => {
    setFetchBtnText("Fetching Data...");

    fetch(`${process.env.NEXT_PUBLIC_STOCK_ALGO_API_URL}/trades/with-prices`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    })
      .then((response) => {
        setFetchBtnText("Fetch Data");

        if (!response.ok) {
          if (response.status === 401) {
            const redirectUrl = process.env.NODE_ENV === "development" ? "/login" : "/Algo_Front_end/login";
            window.location.href = redirectUrl;
          } else {
            // Handle other errors
            throw new Error("Network response was not ok");
          }
        }
        return response.json();
      })
      .then((data) => setRows(data.map((item: any) => ({ ...item }))))
      .catch((error) => console.error("Error fetching data: ", error));
  };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center">
        <button onClick={fetchData} className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          {fetchBtnText}
        </button>

        <a href="/Algo_Front_end/" className="text-blue-700 hover:text-blue-900">
          Doge Coin Dashboard
        </a>
      </div>

      {fetchBtnText == "Fetching Data..." && <p className="text-red-700 pb-4">Fetching data can take up to 2 mins.</p>}

      <table className="table-auto w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Symbol</th>
            <th className="px-4 py-2">Last Fill</th>
            <th className="px-4 py-2">Current Bid</th>
            <th className="px-4 py-2">Difference</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{row.symbol}</td>
              <td className="border px-4 py-2">${row.last_fill.toFixed(2)}</td>
              <td className="border px-4 py-2">${row.bid_price.toFixed(2)}</td>
              <td className="border px-4 py-2">${row.diff.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
