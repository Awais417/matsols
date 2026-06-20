import { Link, useLocation } from "react-router-dom";

const SAFE_INTERNAL_PATHS = [
  "/",
  "/about",
  "/login",
  "/faqs",
  "/events",
  "/degrees",
  "/scholarships",
  "/universities",
  "/free-consultation",
  "/what-we-offer",
];

const hasSafeInternalPath = (value) =>
  SAFE_INTERNAL_PATHS.some(
    (path) => value === path || value.startsWith(`${path}/`),
  );

const normalizeInternalPath = (value) => {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed || trimmed === "#" || /^javascript:/i.test(trimmed)) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return "";

  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return hasSafeInternalPath(withSlash) ? withSlash : "";
};

export const resolvePublicCtaTarget = (
  rawValue,
  fallbackValue = "/free-consultation",
) => {
  const normalized = normalizeInternalPath(rawValue);
  if (/^https?:\/\//i.test(normalized)) {
    return { external: true, href: normalized };
  }

  const fallback = normalizeInternalPath(fallbackValue) || "/free-consultation";
  return {
    external: false,
    to: normalized || fallback,
  };
};

const PublicCtaLink = ({
  to,
  fallbackTo = "/free-consultation",
  consultationState,
  children,
  ...rest
}) => {
  const location = useLocation();
  const target = resolvePublicCtaTarget(to, fallbackTo);

  if (target.external) {
    return (
      <a href={target.href} target="_blank" rel="noreferrer" {...rest}>
        {children}
      </a>
    );
  }

  const state =
    target.to === "/free-consultation"
      ? {
          backgroundLocation: location,
          ...(consultationState || {}),
        }
      : rest.state;

  return (
    <Link to={target.to} {...rest} state={state}>
      {children}
    </Link>
  );
};

export default PublicCtaLink;
