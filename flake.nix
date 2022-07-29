{
  description = "Nix dev shell for building liquid-funding.";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-21.11";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config = { permittedInsecurePackages = [ "nodejs-10.24.1" ]; };
        };
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs-10_x (yarn.override { nodejs = nodejs-10_x; })
          ];
        };
      }
    );
}
