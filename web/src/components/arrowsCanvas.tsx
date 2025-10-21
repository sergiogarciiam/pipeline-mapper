interface ArrowsCanvasProps {
  arrows: Array<{ start: DOMRect; end: DOMRect }>;
}

const ArrowsCanvas = ({ arrows }: ArrowsCanvasProps) => {
  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      {arrows.map((arrow, index) => (
        <line
          key={index}
          x1={arrow.start.right}
          y1={arrow.start.top + arrow.start.height / 2}
          x2={arrow.end.left}
          y2={arrow.end.top + arrow.end.height / 2}
          stroke="#fff"
          strokeWidth="1.5"
          opacity={0.7}
          markerEnd="url(#arrowhead)"
        />
      ))}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#fff" />
        </marker>
      </defs>
    </svg>
  );
};

export default ArrowsCanvas;
