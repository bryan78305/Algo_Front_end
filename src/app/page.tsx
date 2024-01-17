"use client";

import { useState, useEffect, ChangeEvent } from "react";

type TableRow = {
  id: number;
  step: number;
  buy_price: number;
  sell_price: number;
  shares_to_buy: number;
  additional_shares: number;
  isEditing: boolean;
  total_shares: number;
  cumulative_shares: number;
  more_shares_needed: number;
  shares_to_sell: number;
};

const bearerToken = localStorage.getItem("access_token") || "";

export default function Home() {
  const [rows, setRows] = useState<TableRow[]>([]);
  const [stepTest, setStepTest] = useState<Number>(100);
  const [stepByCount, setStepByCount] = useState<TableRow>();
  const [editingRow, setEditingRow] = useState<TableRow | null>(null);

  //
  // Fetch data from API
  //
  const fetchData = () => {
    fetch(`${process.env.NEXT_PUBLIC_ALGO_API_URL}/api/v1/steps`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/login";
          } else {
            // Handle other errors
            throw new Error("Network response was not ok");
          }
        }
        return response.json();
      })
      .then((data) => setRows(data.map((item: any) => ({ ...item, isEditing: false }))))
      .catch((error) => console.error("Error fetching data: ", error));

    fetch(`${process.env.NEXT_PUBLIC_ALGO_API_URL}/api/v1/steps/count/` + stepTest, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setStepByCount(data))
      .catch((error) => console.error("Error fetching data: ", error));
  };

  useEffect(() => {
    fetchData();
  }, []);

  //
  // Toggle editing
  //
  const toggleEdit = (index: number) => {
    if (rows[index].isEditing && editingRow) {
      rows[index].buy_price = Number(rows[index].buy_price);
      rows[index].sell_price = Number(rows[index].sell_price);
      rows[index].shares_to_buy = Number(rows[index].shares_to_buy);
      rows[index].additional_shares = Number(rows[index].additional_shares);

      // Save changes
      fetch(`${process.env.NEXT_PUBLIC_ALGO_API_URL}/api/v1/steps/${rows[index].id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rows[index]),
      })
        .then(() => fetchData())
        .catch((error) => console.error("Error saving row: ", error));
    } else {
      // Start editing
      setEditingRow({ ...rows[index] });
    }

    const newRows = rows.map((row, i) => {
      if (i === index) {
        return { ...row, isEditing: !row.isEditing };
      }
      return row;
    });
    setRows(newRows);
  };

  //
  // Handle editing
  //
  const handleEditChange = (index: number, field: keyof TableRow, value: string) => {
    const updatedRows = rows.map((row, i) => {
      if (i === index) {
        return { ...row, [field]: value };
      }
      return row;
    });

    setRows(updatedRows);
  };

  //
  // Add/delete rows
  //
  const addRow = () => {
    const newRow = { buy_price: 0, sell_price: 0, shares_to_buy: 0, additional_shares: 0 };
    fetch(`${process.env.NEXT_PUBLIC_ALGO_API_URL}/api/v1/steps`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newRow),
    })
      .then(() => fetchData())
      .catch((error) => console.error("Error adding row: ", error));
  };

  //
  // Delete row
  //
  const deleteRow = (id: number) => {
    fetch(`${process.env.NEXT_PUBLIC_ALGO_API_URL}/api/v1/steps/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    })
      .then(() => fetchData())
      .catch((error) => console.error("Error deleting row: ", error));
  };

  //
  // doSubmitShareTest will submit the test to the server for share count.
  //
  const doSubmitShareTest = () => {
    fetchData();
  };

  //
  // restartAlgo will send api request to restart the algo.
  //
  const restartAlgo = () => {
    const body = {};
    fetch(`${process.env.NEXT_PUBLIC_ALGO_API_URL}/api/v1/algo/restart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(body),
    })
      .then(() => alert("Algo restarted"))
      .catch((error) => console.error("Error restarting algo: ", error));
  };

  return (
    <div className="container mx-auto p-4">
      <button onClick={addRow} className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Add Row
      </button>
      <button onClick={restartAlgo} className="mb-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-6">
        Restart Algo
      </button>
      <table className="table-auto w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Step</th>
            <th className="px-4 py-2">Buy Price</th>
            <th className="px-4 py-2">Sell Price</th>
            <th className="px-4 py-2">Shares To Buy</th>
            <th className="px-4 py-2">Additional Shares</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id}>
              <td className="border px-4 py-2">{row.step}</td>
              <td className="border px-4 py-2">
                {row.isEditing ? (
                  <input
                    type="text"
                    value={row.buy_price}
                    onChange={(e) => handleEditChange(index, "buy_price", e.target.value)}
                    className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                ) : (
                  row.buy_price
                )}
              </td>
              <td className="border px-4 py-2">
                {row.isEditing ? (
                  <input
                    type="text"
                    value={row.sell_price}
                    onChange={(e) => handleEditChange(index, "sell_price", e.target.value)}
                    className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                ) : (
                  row.sell_price
                )}
              </td>
              <td className="border px-4 py-2">
                {row.isEditing ? (
                  <input
                    type="text"
                    value={row.shares_to_buy}
                    onChange={(e) => handleEditChange(index, "shares_to_buy", e.target.value)}
                    className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                ) : (
                  row.shares_to_buy
                )}
              </td>
              <td className="border px-4 py-2">
                {row.isEditing ? (
                  <input
                    type="text"
                    value={row.additional_shares}
                    onChange={(e) => handleEditChange(index, "additional_shares", e.target.value)}
                    className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                ) : (
                  row.additional_shares
                )}
              </td>
              <td className="border px-4 py-2 flex space-x-2">
                <button onClick={() => toggleEdit(index)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                  {row.isEditing ? "Save" : "Edit"}
                </button>
                <button onClick={() => deleteRow(row.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 border rounded-lg p-6">
        <p className="font-bold mt-2 mb-4">Test Steps</p>
        <input
          type="text"
          value={String(stepTest)}
          onChange={(e) => setStepTest(Number(e.target.value))}
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <button onClick={() => doSubmitShareTest()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 ml-4 px-4 rounded">
          Submit
        </button>

        <table className="table-auto w-full mt-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Step</th>
              <th className="px-4 py-2">Buy Price</th>
              <th className="px-4 py-2">Sell Price</th>
              <th className="px-4 py-2">Shares To Buy</th>
              <th className="px-4 py-2">Additional Shares</th>
              <th className="px-4 py-2">Total Shares</th>
              <th className="px-4 py-2">Additional Shares</th>
              <th className="px-4 py-2">Cumulative Shares</th>
              <th className="px-4 py-2">More Shares Needed</th>
              <th className="px-4 py-2">Shares To Sell</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">{stepByCount?.step}</td>
              <td className="border px-4 py-2">{stepByCount?.buy_price}</td>
              <td className="border px-4 py-2">{stepByCount?.sell_price}</td>
              <td className="border px-4 py-2">{stepByCount?.shares_to_buy}</td>
              <td className="border px-4 py-2">{stepByCount?.additional_shares}</td>
              <td className="border px-4 py-2">{stepByCount?.total_shares}</td>
              <td className="border px-4 py-2">{stepByCount?.additional_shares}</td>
              <td className="border px-4 py-2">{stepByCount?.cumulative_shares}</td>
              <td className="border px-4 py-2">{stepByCount?.more_shares_needed}</td>
              <td className="border px-4 py-2">{stepByCount?.shares_to_sell}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
