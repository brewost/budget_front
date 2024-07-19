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
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/ledger/total`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data); 
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const calculateTotalSum = () => {
    // Calculate total sum of transactions fetched
    const sum = transactions.reduce((accumulator, transaction) => {
      const transactionAmount = transaction.debit ? -parseFloat(transaction.money) : parseFloat(transaction.money);
      return accumulator + transactionAmount;
    }, 0);

    // Check if sum is a valid number before using .toFixed()
    if (!isNaN(sum)) {
      setTotalSum(sum); // Update total sum state
    } else {
      console.warn('Invalid total sum:', sum); // Log a warning for invalid sum
    }
  };


  const handleCostChange = (e) => {
    // Step 1: Extract and validate input value
    const value = e.target.value.replace(/[^\d.]/g, ''); // Allow only digits and dot
    setCost(value);

    // Step 2: Calculate costValue
    const costValue = parseFloat(value);

    // Step 3: Calculate progress percentage
    let percentage = 0;
    if (!isNaN(costValue)) {
      const difference = costValue - totalSum;
      percentage = ((costValue - difference) / costValue) * 100;
    }

    // Step 4: Update progress state
    setProgress(percentage);
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



  return (
    <div className="jar-container">
      <h2>Jar</h2>
     <div className="jar-dropzone" onDrop={handleDrop} onDragOver={handleDragOver}>
        <img id="jar-image" src="#" alt="Drop an image here" />
       
      </div>
      <div className="progress-bar">
        <progress value={progress} max="100"></progress>
        <p>Total: £{totalSum.toFixed(2)}</p>
        <input
          type="text"
          value={cost}
          onChange={handleCostChange}
          placeholder="Enter cost in £"
          pattern="\d*" // Allow only digits and dot
        />
      </div>
    </div>
  );
};

export default Jar;

