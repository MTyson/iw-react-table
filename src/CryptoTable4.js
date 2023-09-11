import React, { useState, useEffect, useMemo } from 'react';
import { useTable, usePagination } from 'react-table';
import './table.css';

const CryptoTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('timestamp'); // Default sort by timestamp
  const [sortOrder, setSortOrder] = useState('asc'); // Default sort order is ascending
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');

  useEffect(() => {
    console.log("Fetching crypto data for tables");
    //fetch("http://35.188.145.46:3001/crypto-data?cryptocurrency=bitcoin&limit=10&sortOrder=asc")
    //fetch("http://35.188.145.46:3001/crypto-data")
    fetch(`http://35.188.145.46:3001/crypto-data?sortBy=${sortBy}&sortOrder=${sortOrder}&cryptocurrency=${selectedCrypto}`)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, [sortBy, sortOrder, selectedCrypto]);

  // Define columns for the table
  const rawColumns = [
    { Header: 'Timestamp', accessor: 'timestamp', sortBy: 'timestamp', sortable: true },
    { Header: 'Cryptocurrency', accessor: 'cryptocurrency', },
    { Header: 'Price', accessor: 'price', sortable: true},
    { Header: 'Volume', accessor: 'volume', },
    { Header: 'Market Cap', accessor: 'marketcap',
    },
  ];
  const columns = useMemo(() => rawColumns, []);

  // Create a table instance
  const {
    getTableProps, getTableBodyProps, headerGroups, page, // Get the current page of data
	   // Add pagination functions and variables
    previousPage,
    nextPage,
    canPreviousPage,
    canNextPage,
    gotoPage, // Add gotoPage function
    pageCount, // Add pageCount variable
    pageOptions, // Add pageOptions variable
    setPageSize, // Add setPageSize function
    prepareRow, state: { pageIndex, pageSize }, // Current page index and page size
  } = useTable({
    columns,
    data,
    initialState: { pageIndex: 0, pageSize: 10 }, // Set the initial page index and page size
  },
    usePagination // Add the usePagination hook
  );

  const handleCryptoChange = (event) => {
    setSelectedCrypto(event.target.value);
  };

  const handleSortClick = (column) => {
    if (column.sortable) {
      // Determine the new sort order
      const newSortOrder = sortBy === column.id && sortOrder === 'asc' ? 'desc' : 'asc';
      setSortBy(column.id);
      setSortOrder(newSortOrder);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <select value={selectedCrypto} onChange={handleCryptoChange}>
        <option value="bitcoin">Bitcoin</option>
        <option value="ethereum">Ethereum</option>
        <option value="solana">Solana</option>
      </select>
	  <div className="pagination">
  <button onClick={() => gotoPage(0)} disabled={pageIndex === 0}>
    {'<<'}
  </button>
  <button onClick={() => previousPage()} disabled={!canPreviousPage}>
    {'<'}
  </button>
  <button onClick={() => nextPage()} disabled={!canNextPage}>
    {'>'}
  </button>
  <button
    onClick={() => gotoPage(pageCount - 1)}
    disabled={pageIndex === pageCount - 1}
  >
    {'>>'}
  </button>
  <span>
    Page{' '}
    <strong>
      {pageIndex + 1} of {pageOptions.length}
    </strong>{' '}
  </span>
  <span>
    | Go to page:{' '}
    <input
      type="number"
      defaultValue={pageIndex + 1}
      onChange={(e) => {
        const page = e.target.value ? Number(e.target.value) - 1 : 0;
        gotoPage(page);
      }}
    />
  </span>
  <select
    value={pageSize}
    onChange={(e) => {
      setPageSize(Number(e.target.value));
    }}
  >
    {[10, 20, 30, 40, 50].map((pageSize) => (
      <option key={pageSize} value={pageSize}>
        Show {pageSize}
      </option>
    ))}
  </select>
</div>

    <table {...getTableProps()} className="crypto-table">

<thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()} onClick={() => handleSortClick(column)}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody {...getTableBodyProps()}>
        {page.map(row => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
   </div>
  );
};

export default CryptoTable;

