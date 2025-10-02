import type { Job } from "../utils/types";

interface ExtendsProps {
  jobData: Job;
  isUndefinedExtends?: boolean;
}

const Extends = ({ jobData, isUndefinedExtends = false }: ExtendsProps) => {
  const extendsArray = jobData.extends || [];

  if (extendsArray.length === 0) return null;

  return extendsArray.map((extend, index) => (
    <div
      key={`${extend}-${index}`}
      style={{
        fontSize: "12px",
        color: isUndefinedExtends ? "red" : "#666",
        marginTop: "4px",
      }}
    >
      ⟶ {extend}
    </div>
  ));
};

export default Extends;
