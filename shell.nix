{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell rec {
  name = "nodejs";

  buildInputs = with pkgs; [
    nodejs nodePackages.webpack nodePackages.webpack-cli
  ];
}
