// nodes/test/index.js

const SimpleNode = (label) => () => <div>{label}</div>;

export default {
  form: {
    label: "🧾 Form",
    category: "UI",
    description: "Form bileşeni",
    component: SimpleNode("Form"),
  },
  input: {
    label: "🔡 Input",
    category: "UI",
    description: "Input alanı",
    component: SimpleNode("Input"),
  },
  button: {
    label: "🔘 Button",
    category: "UI",
    description: "Buton bileşeni",
    component: SimpleNode("Button"),
  },
};
