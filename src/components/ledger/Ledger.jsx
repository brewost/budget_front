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
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid content type, expected JSON');
      }
      const data = await response.json();
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
          <li key={transaction.id}>
            <span className="transaction-name">{transaction.name}</span>
            <span className="transaction-amount">{transaction.debit ? '-' : ''}£{transaction.money}</span>
            <span className="transaction-category">{transaction.category_name}</span>
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


