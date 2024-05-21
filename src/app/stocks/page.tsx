"use client";

import { useState, useEffect, ChangeEvent } from "react";

type TableRow = {
  symbol: string;
  qty: number;
  step_price: number;
  current_price: number;
  diff: number;
  step_size: number;
  selling: boolean;
  lot_size: number;
  has_order: boolean;
  buy_order_qty: number;
  buy_order_price: number;
  sell_order_qty: number;
  sell_order_price: number;
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
      .then((data) => setRows(data.map((item: any) => ({ ...item, selling: false }))))
      .catch((error) => console.error("Error fetching data: ", error));
  };

  //
  // When user clicks the sell button we call this function
  // that makes an API POST call with the symbol, qty, and price
  //
  const sellStock = (row: TableRow, index: number) => {
    const newRows = [...rows];
    newRows[index].selling = true;
    setRows(newRows);

    fetch(`${process.env.NEXT_PUBLIC_STOCK_ALGO_API_URL}/trades/close`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({ symbol: row.symbol, qty: row.lot_size, price: row.current_price }),
    })
      .then((response) => {
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
      .then((data) => {
        console.log("Stock sold: ", data);
        setTimeout(() => fetchData(), 2000);
      })
      .catch((error) => console.error("Error selling stock: ", error));
  };

  const OrderDetails = ({ row }: { row: TableRow }) => {
    return (
      <div>
        <p className={row.buy_order_qty > 0 ? "" : "text-red-700"}>
          Buy: ${row.buy_order_price.toFixed(2)} ({row.buy_order_qty})
        </p>
        <p className={row.sell_order_qty > 0 ? "" : "text-red-700"}>
          Sell: ${row.sell_order_price.toFixed(2)} ({row.sell_order_qty})
        </p>
      </div>
    );
  };

  // On load of the page
  useEffect(() => {
    fetchData();
  }, []);

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
            <th className="px-4 py-2">Qty</th>
            <th className="px-4 py-2">Lot Size</th>
            <th className="px-4 py-2">Step Size</th>
            <th className="px-4 py-2">Last Buy Price</th>
            <th className="px-4 py-2">Current Market</th>
            <th className="px-4 py-2">Difference</th>
            <th className="px-4 py-2">Delta to Next</th>
            <th className="px-4 py-2">Orders</th>
            <th className="px-4 py-2">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="border px-4 py-2 text-center">{row.symbol}</td>
              <td className="border px-4 py-2 text-center">{row.qty}</td>
              <td className="border px-4 py-2 text-center">{row.lot_size}</td>
              <td className="border px-4 py-2 text-center">${row.step_size}</td>
              <td className="border px-4 py-2 text-center">${row.step_price.toFixed(2)}</td>
              <td className="border px-4 py-2 text-center">${row.current_price.toFixed(2)}</td>
              <td className="border px-4 py-2 text-center">${row.diff.toFixed(2)}</td>
              <td className="border px-4 py-2 text-center">${(row.step_size - row.diff).toFixed(2)}</td>
              <td className="border px-4 py-2 text-center">
                <OrderDetails row={row} />
              </td>
              <td className="border px-4 py-2 text-center">
                {row.selling}
                {row.selling && <p className="text-red-700">Selling...</p>}
                {!row.selling && (
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => sellStock(row, index)}>
                    Sell {row.lot_size} Shares @ ${row.current_price.toFixed(2)}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
