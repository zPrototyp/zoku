import { useState } from "react";

export function NumberForm({ likes, limit, onSubmit }) {
  const [value, setValue] = useState("");
  const [buttonActive, setButtonActive] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = Number(value);

    if (num >= 1 && num <= limit) {
      onSubmit(num);
      setValue(""); // reset after submit
    } else {
      alert(`Please enter a number between 1 and ${limit}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
        {/* <p>Autolikes: {likes} </p> */}
      <label>
        Users currently get <strong>{likes}</strong> automatically liked brands
         {/* (1–{limit}):{" "} */}
        <input
          type="number"
          min="1"
          max={limit}
        //   placeholder={likes}
          value={value}
          onChange={(e) => {setValue(e.target.value)
            if (e.target.value != likes)
                setButtonActive(true)
            else setButtonActive(false)
          }}
        />
      </label>
      <button type="submit" className={!buttonActive ? '':'active'}
        style={!buttonActive ?{ cursor: "not-allowed", pointerEvents: "none" }:{}}>Update autoliked brands ({`1–${limit} `})</button>
    </form>
  );
}