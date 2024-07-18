import { useState, useEffect } from 'react';
import '../../App.css';
import './jar.css';

const Jar = () => {
  const [cost, setCost] = useState(''); // Example cost in pounds
  const [progress, setProgress] = useState(0);
  const [totalSum, setTotalSum] = useState(0); // Total sum of transactions fetched from backend
  const [transactions, setTransactions] = useState([]); // Array to hold fetched transactions

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    calculateTotalSum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/ledger`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data); // Assuming the API response is an array of transactions
      console.log('Fetched transactions:', data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const calculateTotalSum = () => {
    // Calculate total sum of transactions fetched
    const sum = transactions.reduce((accumulator, transaction) => {
      const transactionAmount = transaction.debit ? -transaction.money : transaction.money;
      return accumulator + transactionAmount;
    }, 0);

    // Check if sum is a valid number before using .toFixed()
    if (!isNaN(sum)) {
      console.log('Total sum of transactions:', sum.toFixed(2)); // Log the sum to console with 2 decimal places
      setTotalSum(sum); // Update total sum state
    } else {
      console.warn('Invalid total sum:', sum); // Log a warning for invalid sum
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        // Set image URL to display dropped image
        document.getElementById('jar-image').src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleCostChange = (e) => {
    const value = e.target.value.replace(/[^\d.]/g, ''); // Allow only digits and dot
    setCost(value);
  };

  const handleProgressChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setProgress(value);
  };

  const calculatePercentage = () => {
    return totalSum ? (progress / totalSum) * 100 : 0;
  };

  // Log total sum and other relevant states on every render
  console.log('Render - totalSum:', totalSum);
  console.log('Render - progress:', progress);
  console.log('Render - cost:', cost);

  return (
    <div className="jar-container">
      <h2>Jar</h2>
      <div className="jar-dropzone" onDrop={handleDrop} onDragOver={handleDragOver}>
        <img id="jar-image" src="#" alt="Picture of what you desire" />
        <p>Drop an image here</p>
      </div>
      <div className="progress-bar">
        <progress value={calculatePercentage()} max="100"></progress>
        <input
          type="number"
          value={progress}
          onChange={handleProgressChange}
          min="0"
          max={totalSum || 0} // Prevents exceeding the total sum
          disabled={!totalSum} // Disable input if total sum is not fetched
        />
      </div>
      <label>
        Cost (£):
        <input
          type="text"
          value={cost}
          onChange={handleCostChange}
          pattern="\d*" // Allow only digits
        />
      </label>
    </div>
  );
};

export default Jar;



