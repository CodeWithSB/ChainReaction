import {useEffect, useState} from 'react';

export default function Square({cell, squareClick, checkForSplit}) {
  const [cellClass, setCellClass] = useState('cell');
  useEffect(() => {
    if(cell !== undefined){
      setCellClass(getCellStyle());
      if(cell.cellValue >= cell.maxAllowedValue){
        setTimeout(()=>{
          checkForSplit();
        }, 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cell, checkForSplit]);

  const getCellStyle = () =>{
    let cellStyle = '';
    switch(cell.cellValue){
      case 2 : 
        cellStyle = 'two-children';
        break;
      case 3 : 
        cellStyle = 'three-children';
        break;
      default:
        cellStyle = '';
        break;
    }
    if(cell.cellValue >= cell.maxAllowedValue){
      return cellStyle + ' active';
    }
    else{
      return cellStyle;
    }
  }

  return (
    <div className={`cell ${cellClass}`} onClick={squareClick}>
      {
        cell !== undefined && cell.cellValue !== 0 
        && [...Array(cell.cellValue).keys()].map(val => <div key={val} className="ball" style={{background:`radial-gradient(circle at 1px 1px, ${cell.cellColor}, #111)`}}></div>)
      }
    </div>
  );
}