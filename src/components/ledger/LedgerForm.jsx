import { useState, useEffect, useCallback } from 'react';
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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (transactionId) {
      fetchTransactionDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/category`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      console.log('Fetched categories:', data); // Log fetched categories
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchTransactionDetails = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/ledger/${transactionId}`);
      if (!response.ok) throw new Error('Failed to fetch transaction details');
      const data = await response.json();
      console.log('Fetched transaction details:', data); // Log transaction details
      setName(data.name);
      setMoney(data.money.toString());
      setDebit(data.debit);
      setSelectedCategoryIds(data.categories.map(category => category.id)); // Set selected categories
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    }
  }, [transactionId]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      let categoryIds = selectedCategoryIds;

      if (showCustomCategoryInput && newCategory.trim()) {
        const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/category`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newCategory.trim() }),
        });

        if (!response.ok) throw new Error('Failed to add new category');

        const data = await response.json();
        console.log('New category added:', data); // Log new category data
        categoryIds = [...categoryIds, data.id]; // Add the new category ID
        fetchCategories(); // Refresh categories list
      }

      const transaction = {
        name,
        money: parseFloat(money),
        debit,
        category_ids: categoryIds, // Send multiple category IDs
      };

      const endpoint = transactionId
        ? `${import.meta.env.VITE_APP_BACKEND_URL}/ledger/${transactionId}`
        : `${import.meta.env.VITE_APP_BACKEND_URL}/ledger`;
      const method = transactionId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) throw new Error(transactionId ? 'Failed to update transaction' : 'Failed to add transaction');

      navigate('/');
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    const categoryId = parseInt(value, 10); // Convert value to integer

    if (categoryId === -1) { // Custom category checkbox value
      setShowCustomCategoryInput(checked);
      if (!checked) setNewCategory(''); // Reset new category if unchecked
    } else {
      setSelectedCategoryIds(prevSelected =>
        checked 
          ? [...new Set([...prevSelected, categoryId])]  // Ensure unique values
          : prevSelected.filter(id => id !== categoryId)
      );
    }
  };

  useEffect(() => {
    console.log('Selected category IDs:', selectedCategoryIds); // Log selected category IDs after state update
  }, [selectedCategoryIds]);

  return (
    <div className="ledger-form">
      <h3>{transactionId ? 'Update Transaction' : 'Add Transaction'}</h3>
      <form onSubmit={handleFormSubmit}>
        <label>
          What?:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          How much?:
          <input
            type="number"
            value={money}
            onChange={(e) => setMoney(e.target.value)}
            step="0.01"
            required
          />
        </label>
       <label>
  In or out?:
  <div className="toggle-buttons">
    <button
      type="button"
      className={`toggle-button ${debit ? 'active' : ''}`}
      onClick={() => setDebit(true)}
    >
      Spent
    </button>
    <button
      type="button"
      className={`toggle-button ${!debit ? 'active' : ''}`}
      onClick={() => setDebit(false)}
    >
      Saved
    </button>
  </div>
</label>
        <label>
          Type?:
          <div className="category-select-container">
            {categories.map((category) => (
              <label key={category.id}>
                <input
                  type="checkbox"
                  name="category"
                  value={category.id}
                  checked={selectedCategoryIds.includes(category.id)}
                  onChange={handleCategoryChange}
                />
                {category.title}
              </label>
            ))}
            <label>
              <input
                type="checkbox"
                name="category"
                value="-1" // Value for the custom category checkbox
                checked={showCustomCategoryInput}
                onChange={handleCategoryChange}
              />
              Add New Category
            </label>
            {showCustomCategoryInput && (
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category name"
                className="custom-category"
                required
              />
            )}
          </div>
        </label>
        <button type="submit">
          {transactionId ? 'Update Transaction' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
};

export default LedgerForm;

