import styled from "@emotion/styled";
import { NavLink, Outlet } from "react-router-dom";

const Cont = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
`;
const Menu = styled.nav`
  border-right: 1px solid white;
  display: flex;
  flex-direction: column;
`;
const LinkIcon = styled(NavLink)`
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  color: inherit;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  &.active {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;
const Content = styled.div`
  padding: 16px;
  height: 100vh;
  width: calc(100vw - 49px);
  overflow-y: auto;
`;

const Icon = ({ name }: { name: string }) => (
  <span className="material-icons">{name}</span>
);

export const Layout = () => (
  <Cont>
    <Menu>
      <LinkIcon to="/">
        <Icon name="home" />
      </LinkIcon>
      <LinkIcon to="/studio">
        <Icon name="movie" />
      </LinkIcon>
      <LinkIcon to="/about">
        <Icon name="info" />
      </LinkIcon>
    </Menu>
    <Content>
      <Outlet />
    </Content>
  </Cont>
);
