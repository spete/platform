package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/influxdata/platform/internal/fs"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

func main() {
	Execute()
}

var influxCmd = &cobra.Command{
	Use:   "influx",
	Short: "Influx Client",
	Run:   influxF,
}

func init() {
	influxCmd.AddCommand(authorizationCmd)
	influxCmd.AddCommand(bucketCmd)
	influxCmd.AddCommand(organizationCmd)
	influxCmd.AddCommand(queryCmd)
	influxCmd.AddCommand(replCmd)
	influxCmd.AddCommand(setupCmd)
	influxCmd.AddCommand(taskCmd)
	influxCmd.AddCommand(userCmd)
	influxCmd.AddCommand(writeCmd)
}

// Flags contains all the CLI flag values for influx.
type Flags struct {
	token string
	host  string
	local bool
}

var flags Flags

func defaultTokenPath() string {
	dir, err := fs.InfluxDir()
	if err != nil {
		return ""
	}
	return filepath.Join(dir, "credentials")
}

func getTokenFromPath(path string) (string, error) {
	b, err := ioutil.ReadFile(path)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func writeTokenToPath(tok string, path string) error {
	return ioutil.WriteFile(path, []byte(tok), 0600)
}

func init() {
	viper.SetEnvPrefix("INFLUX")

	influxCmd.PersistentFlags().StringVarP(&flags.token, "token", "t", "", "API token to be used throughout client calls")
	viper.BindEnv("TOKEN")
	if h := viper.GetString("TOKEN"); h != "" {
		flags.token = h
	} else if tok, err := getTokenFromPath(defaultTokenPath()); err == nil {
		flags.token = tok
	}

	influxCmd.PersistentFlags().StringVar(&flags.host, "host", "http://localhost:9999", "HTTP address of Influx")
	viper.BindEnv("HOST")
	if h := viper.GetString("HOST"); h != "" {
		flags.host = h
	}

	influxCmd.PersistentFlags().BoolVar(&flags.local, "local", false, "Run commands locally against the filesystem")
}

func influxF(cmd *cobra.Command, args []string) {
	cmd.Usage()
}

// Execute executes the influx command
func Execute() {
	if err := influxCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
