export default function Logo({ className = "h-12", src = "/logo.png" }) {
    return <img src={src} alt="Avenzo" className={`${className} w-auto`} />;
}