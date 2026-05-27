import { useState } from "react";

export const Dnd = () => {
  const [list, setList] = useState(["alice", "bob", "charlie", "daniel"]);

  return (
    <ul>
      {list.map((value) => (
        <li
          key={value}
          draggable
          onDragStart={(evt) => {
            evt.dataTransfer.setData("dragId", value);
          }}
          onDragOver={(evt) => {
            evt.preventDefault();
            evt.stopPropagation();
          }}
          onDrop={(evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            const dragId = evt.dataTransfer.getData("dragId");
            const [dragged] = list.splice(list.indexOf(dragId), 1);
            list.splice(list.indexOf(value), 0, dragged);
            setList([...list]);
          }}
          style={{
            cursor: "grab",
          }}
        >
          {value}
        </li>
      ))}
    </ul>
  );
};
