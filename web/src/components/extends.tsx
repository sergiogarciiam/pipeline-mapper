interface ExtendsProps {
  jobData: {
    extends?: string | string[];
  };
  extendables: string[];
}

const Extends = ({ jobData, extendables }: ExtendsProps) => {
  if (!jobData.extends) return null;

  const extendsArray = Array.isArray(jobData.extends)
    ? jobData.extends
    : [jobData.extends];

  return extendsArray.map((extend, index) => (
    <div
      key={`${extend}-${index}`}
      style={{
        fontSize: "12px",
        color: `${extendables.includes(extend) ? "#666" : "red"}`,
        marginTop: "4px",
      }}
    >
      ⟶ {extend}
    </div>
  ));
};

export default Extends;
