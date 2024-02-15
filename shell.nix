{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell rec {
  name = "nodejs";

  NODE_OPTIONS="--openssl-legacy-provider";

  buildInputs = with pkgs; [
    nodejs nodePackages.webpack nodePackages.webpack-cli
  ];
}
