import styled from "@emotion/styled";

const Cont = styled.div`
  width: 256px;
  height: 46px;
  background-color: grey;
  position: relative;
`;

const Bar = styled.div<{ progress: number }>`
  height: 100%;
  width: ${(props) => `${100 * props.progress}%`};
  background-color: white;
`;

const Label = styled.div`
  color: black;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 8px;
`;

export const ProgressBar = ({ progress }: { progress: number }) => (
  <Cont role="progressbar">
    <Bar progress={progress} />
    <Label>{~~(100 * progress)}%</Label>
  </Cont>
);
