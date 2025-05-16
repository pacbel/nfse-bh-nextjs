import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/emitir-nfse");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecionando...</p>
    </div>
  );
};

export default Home;
