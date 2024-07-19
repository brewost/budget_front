import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import './ledger.css';

const Ledger = () => {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/ledger`);
      console.log('Response status:', response.status); // Log response status
      console.log('Response headers:', response.headers); // Log response headers
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const contentType = response.headers.get('Content-Type');
      console.log('Content-Type:', contentType); // Log Content-Type header
      
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid content type, expected JSON');
      }

      const data = await response.json();
      console.log('Fetched data:', data); // Log the fetched data
      
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const goToForm = () => {
    navigate('/ledger-form');
  };

  const handleUpdate = (id) => {
    navigate(`/ledger-form?id=${id}`);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/ledger/${id}`, {
        method: 'DELETE',
      });
      console.log('Delete response status:', response.status); // Log response status
      if (!response.ok) {
        throw new Error(`Failed to delete transaction with ID ${id}`);
      }
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  return (
    <div className="ledger-container">
      <h3>Transaction List</h3>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id} className="transaction-item">
            <span className="transaction-name">{transaction.name}</span>
            <span className="transaction-amount">{transaction.debit ? '-' : ''}£{transaction.money}</span>
            <div className="transaction-categories">
              {transaction.categories && transaction.categories.length > 0
                ? transaction.categories.map((category) => (
                    <span key={category.id} className="transaction-category">{category.name}</span>
                  ))
                : 'No categories'}
            </div>
            <button className="inner-ledger-button" onClick={() => handleUpdate(transaction.id)}>Update</button>
            <button className="inner-ledger-button" onClick={() => handleDelete(transaction.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <div className="button-container">
        <button className="ledger-button" onClick={goToForm}>Add Transaction</button>
      </div>
    </div>
  );
};

export default Ledger;


