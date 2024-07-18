import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../App.css';
import './ledgerform.css';

const LedgerForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const transactionId = queryParams.get('id');

  const [name, setName] = useState('');
  const [money, setMoney] = useState('');
  const [debit, setDebit] = useState(true); // Default to true for debit
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [customCategory, setCustomCategory] = useState(false); // State to toggle custom category input

  useEffect(() => {
    fetchCategories();
    if (transactionId) {
      fetchTransactionDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/category`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTransactionDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/ledger/${transactionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transaction details');
      }
      const data = await response.json();
      setName(data.name);
      setMoney(data.money.toString());
      setDebit(data.debit);
      setSelectedCategoryId(data.category_id.toString());
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      let categoryId;
      if (customCategory) {
        const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/category`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: newCategory }),
        });
        if (!response.ok) {
          throw new Error('Failed to add new category');
        }
        const data = await response.json();
        categoryId = data.id; // Assuming the response from backend includes the new category ID
        fetchCategories(); // Refresh categories after adding a new one
      } else {
        categoryId = selectedCategoryId;
      }

      const transaction = {
        name,
        money: parseFloat(money),
        debit,
        category_id: categoryId,
      };

      let endpoint = `${import.meta.env.VITE_APP_BACKEND_URL}/ledger`;
      let method = 'POST';

      if (transactionId) {
        endpoint += `/${transactionId}`;
        method = 'PUT';
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new Error(transactionId ? 'Failed to update transaction' : 'Failed to add transaction');
      }

      navigate('/');
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setCustomCategory(false);
    } else if (value === '__custom__') {
      setCustomCategory(true);
    } else {
      setSelectedCategoryId(value);
      setCustomCategory(false);
    }
  };

  return (
    <div className="ledger-form">
      <h3>{transactionId ? 'Update Transaction' : 'Add Transaction'}</h3>
      <form onSubmit={handleFormSubmit}>
        <label>
          What?:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          How much?:
          <input type="number" value={money} onChange={(e) => setMoney(e.target.value)} step="0.01" required />
        </label>
        <label>
          In or out?:
          <div className="toggle-buttons">
            <button type="button" className={`toggle-button ${debit ? 'active' : ''}`} onClick={() => setDebit(true)}>Out</button>
            <button type="button" className={`toggle-button ${!debit ? 'active' : ''}`} onClick={() => setDebit(false)}>In</button>
          </div>
        </label>
        <label>
          Type?:
          <select value={customCategory ? '__custom__' : selectedCategoryId} onChange={handleCategoryChange} required>
            <option value="">Select or add new category...</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.title}</option>
            ))}
            <option value="__custom__">Add New Category</option>
          </select>
          {customCategory && (
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category name"
              className="custom-category"
              required
            />
          )}
        </label>
        <button type="submit">{transactionId ? 'Update Transaction' : 'Add Transaction'}</button>
      </form>
    </div>
  );
};

export default LedgerForm;



